self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();

    if (data.type === 'INCOMING_CALL') {
      // 1. Broadcast to any open React tabs
      const broadcast = new BroadcastChannel('call-notifications');
      broadcast.postMessage({
        type: 'INCOMING_CALL',
        url: data.url
      });

      // 2. Show the system notification
      const options = {
        body: data.body || 'Incoming Video Session',
        icon: '/iconLogo.jpeg',
        badge: '/iconLogo.jpeg',
        vibrate: [200, 100, 200, 100, 200, 100, 200], // Simulates a ringing vibration pattern
        requireInteraction: true, // CRITICAL: Keeps notification on screen until dismissed
        data: { url: data.url },
        actions: [
          { action: 'answer', title: 'Answer' },
          { action: 'ignore', title: 'Ignore' }
        ]
      };

      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
          // Check if any open window is already on the video room URL
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].url.includes(data.url) && clientList[i].visibilityState === 'visible') {
              // The user is already in the room and looking at it, do not show notification
              return;
            }
          }
          return self.registration.showNotification(data.title || 'Incoming Call', options);
        })
      );
    }
  } catch (e) {
    console.error('Push event parsing failed', e);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'answer' || !event.action) {
    const relativeUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/dashboard';
    const fullUrl = new URL(relativeUrl, self.location.origin).href;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        // 1. If a tab is already open on this room URL, bring it to focus
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === fullUrl || client.url.includes(relativeUrl)) {
            if ('focus' in client) {
              return client.focus();
            }
          }
        }

        // 2. Navigate an existing app tab to the call room URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ('navigate' in client && typeof client.navigate === 'function') {
            return client.navigate(fullUrl).then(function (targetClient) {
              if (targetClient && 'focus' in targetClient) {
                return targetClient.focus();
              }
            }).catch(function () {
              if (clients.openWindow) return clients.openWindow(fullUrl);
            });
          }
        }

        // 3. Fallback: Open a brand new window with the full absolute URL
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
    );
  } else if (event.action === 'ignore') {
    // Dismiss notification
  }
});
