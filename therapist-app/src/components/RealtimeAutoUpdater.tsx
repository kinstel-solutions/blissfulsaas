"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const supabaseClient = createClient();

export default function RealtimeAutoUpdater({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!currentUserId) return;

    console.log("[RealtimeAutoUpdater] Subscribing to notifications for:", currentUserId);

    // Listen for NEW notifications for this user
    const channel = supabaseClient
      .channel(`auto-update-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `userId=eq.${currentUserId}`,
        },
        (payload) => {
          console.log("[RealtimeAutoUpdater] New notification received, refreshing dashboard...", payload);
          // Trigger a server-side data re-fetch for the current page
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Notification",
          filter: `userId=eq.${currentUserId}`,
        },
        () => {
          // Also refresh on updates (e.g. if a notification status changes or something)
          // though INSERT is the primary trigger for new data
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log(`[RealtimeAutoUpdater] Subscription status: ${status}`);
      });

    return () => {
      console.log("[RealtimeAutoUpdater] Unsubscribing...");
      supabaseClient.removeChannel(channel);
    };
  }, [currentUserId, router]);

  // This component doesn't render anything
  return null;
}
