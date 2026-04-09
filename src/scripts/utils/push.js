const VAPID_PUBLIC_KEY = 'ISI_DARI_API_DICODING'; // pastikan valid

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// =======================
// SUBSCRIBE
// =======================
export async function subscribePush() {
  try {
    const token = localStorage.getItem('accessToken');

    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const response = await fetch(
      'https://story-api.dicoding.dev/v1/notifications/subscribe',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth,
          },
        }),
      }
    );

    const data = await response.json();
    console.log('Subscribe berhasil:', data);
  } catch (error) {
    console.error('Subscribe gagal:', error);
  }
}

// =======================
// UNSUBSCRIBE (ADVANCED)
// =======================
export async function unsubscribePush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribe berhasil');
    }
  } catch (error) {
    console.error('Unsubscribe gagal:', error);
  }
}