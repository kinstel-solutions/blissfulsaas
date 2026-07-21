self.addEventListener('push', function(event) {
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
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
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

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'answer' || !event.action) {
    // Open the app window to the specific room URL
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        let targetClient = null;
        
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          // If the window is already exactly on the room URL, focus it
          if (client.url.includes(event.notification.data.url)) {
            if ('focus' in client) return client.focus();
            return;
          }
          // Otherwise, save the first available window to navigate
          if (!targetClient && 'navigate' in client) {
            targetClient = client;
          }
        }
        
        // If we found an existing window, navigate it to the room URL
        if (targetClient) {
          return targetClient.navigate(event.notification.data.url).then(function(client) {
            if (client && 'focus' in client) {
              return client.focus();
            }
          });
        }

        // If no windows are open, open a brand new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  } else if (event.action === 'ignore') {
    // Optional: Could send a fetch request to the backend to notify the caller
  }
});
