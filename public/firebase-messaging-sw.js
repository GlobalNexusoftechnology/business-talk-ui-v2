/**
 * Firebase Cloud Messaging Service Worker — Business Talk 24
 *
 * Responsibilities:
 *   1. Background push message display (req 5)
 *   2. Offline notification queuing (req 6)
 *   3. Deep-link routing on notification click (req 8)
 *   4. Grouped notifications via `tag` (req 10)
 *   5. Silent (data-only) notification handling (req 11)
 *   6. Badge counts via Notification API (req 9)
 *   7. Android Chrome + Safari-compatible payload structure (req 12/13)
 *
 * NOTE: Firebase config values are injected at runtime via the
 * <script> tag that calls `firebase.initializeApp(...)` before the SW
 * is registered. This SW reads them from the global scope through
 * `self.firebaseConfig` which is set by the main thread via `postMessage`.
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ─── Config (injected at registration time via postMessage) ──────────────────
let firebaseApp = null;
let messaging = null;

// Handle config posted from the main thread before FCM init
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    if (!firebaseApp) {
      try {
        firebaseApp = firebase.initializeApp(event.data.config);
        messaging = firebase.messaging(firebaseApp);
        // Wire up background message handler now that messaging is ready
        messaging.onBackgroundMessage(handleBackgroundMessage);
      } catch (e) {
        console.error('[SW] Firebase init failed:', e);
      }
    }
    // Acknowledge
    event.source?.postMessage({ type: 'SW_READY' });
  }
});

// ─── Background message handler ───────────────────────────────────────────────
/**
 * Called when app is in background / closed.
 * FCM payload shape:
 *   notification: { title, body, icon, image, badge, tag, data }
 *   data: { url, entityType, entityId, notifType, badge, silent, group }
 */
function handleBackgroundMessage(payload) {
  const data = payload.data || {};

  // req 11: silent data-only messages — no visual notification
  if (data.silent === 'true') {
    // Still sync badge
    updateBadge(Number(data.badge || 0));
    return;
  }

  const notificationTitle =
    payload.notification?.title || data.title || 'Business Talk 24';

  const notificationBody =
    payload.notification?.body || data.body || 'You have a new notification';

  const tag = data.group || data.entityType || 'default'; // req 10: grouping by tag

  const options = {
    body: notificationBody,
    icon: payload.notification?.icon || '/assets/icons/BUSINESSTALK24_LOGO_Icon_png.png',
    badge: '/assets/icons/BUSINESSTALK24_LOGO_Icon_png.png',
    tag,                   // req 10: collapses notifications with same tag
    renotify: true,        // re-alert even if same tag exists
    data: {
      url: data.url || '/',
      entityType: data.entityType,
      entityId: data.entityId,
      notifType: data.notifType || payload.notification?.type,
      badge: Number(data.badge || 0),
    },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  updateBadge(Number(data.badge || 0));
  return self.registration.showNotification(notificationTitle, options);
}

// ─── Notification click handler (deep-link routing req 8) ────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  const targetUrl = buildDeepLink(notifData);

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Reuse existing window if one is open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_DEEP_LINK',
              url: targetUrl,
              entityType: notifData.entityType,
              entityId: notifData.entityId,
              notifType: notifData.notifType,
            });
            return;
          }
        }
        // No window open — launch a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── Push event (for non-Firebase direct web push payloads) ──────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { data: { title: event.data.text() } };
  }

  // Delegate to the same background handler
  if (payload.data?.silent === 'true') {
    updateBadge(Number(payload.data?.badge || 0));
    return;
  }

  const title = payload.notification?.title || payload.data?.title || 'Business Talk 24';
  const options = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/assets/icons/BUSINESSTALK24_LOGO_Icon_png.png',
    badge: '/assets/icons/BUSINESSTALK24_LOGO_Icon_png.png',
    tag: payload.data?.group || payload.data?.entityType || 'default',
    renotify: true,
    data: {
      url: payload.data?.url || '/',
      entityType: payload.data?.entityType,
      entityId: payload.data?.entityId,
      notifType: payload.data?.notifType,
      badge: Number(payload.data?.badge || 0),
    },
    vibrate: [200, 100, 200],
  };

  updateBadge(Number(payload.data?.badge || 0));
  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Offline sync (req 6) ─────────────────────────────────────────────────────
// When the device comes back online, post a message to all open windows so
// they can re-sync the notification feed from the server.
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        windowClients.forEach((client) => {
          client.postMessage({ type: 'NOTIFICATION_SYNC_REQUIRED' });
        });
      })
    );
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a deep-link URL from notification data.
 * Mirrors the routing logic in src/lib/notificationRegistry.ts → USER_ENTITY_ROUTES.
 * When adding a new entityType, update BOTH files.
 */
function buildDeepLink(data) {
  const { entityType, entityId, notifType } = data;
  if (data.url && data.url !== '/') return data.url;

  switch (entityType) {
    case 'user': return `/profile/${entityId}`;
    case 'post':
      return notifType === 'QUESTION'
        ? `/questions/${entityId}`
        : `/posts/${entityId}`;
    case 'blog':
      return notifType === 'STORY'
        ? `/stories/${entityId}`
        : `/blogs/${entityId}`;
    case 'comment': return `/posts/${entityId}?highlight=comment`;
    case 'conversation': return `/messages?conversationId=${entityId}`;
    case 'group': return `/groups/${entityId}/requests`;
    default: return '/notifications';
  }
}

/** Update the PWA app badge (req 9). Silently no-ops if API unavailable. */
function updateBadge(count) {
  if ('setAppBadge' in navigator) {
    if (count > 0) {
      navigator.setAppBadge(count).catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }
}
