const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

export async function subscribePush() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    alert('Login dulu sebelum subscribe!');
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    // 🔥 CEK SUDAH PERNAH SUBSCRIBE KE SERVER
    const alreadySent = localStorage.getItem('pushSubscribed');

    if (subscription && alreadySent) {
      alert('Sudah subscribe sebelumnya');
      return;
    }

    // 🔥 SUBSCRIBE KE BROWSER
    if (!subscription) {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        alert('Izin notifikasi ditolak');
        return;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // 🔥 KIRIM KE SERVER (SEKALI SAJA)
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Gagal subscribe ke server');
    }

    // 🔥 SIMPAN STATUS
    localStorage.setItem('pushSubscribed', 'true');

    console.log('SUBSCRIBE SUCCESS');
    alert('Berhasil subscribe!');
  } catch (error) {
    console.error(error);
    alert('Subscribe gagal');
  }
}

export async function unsubscribePush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      alert('Belum subscribe');
      return;
    }

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });

    if (!response.ok) {
      throw new Error('Gagal unsubscribe dari server');
    }

    await subscription.unsubscribe();

    // 🔥 HAPUS FLAG
    localStorage.removeItem('pushSubscribed');

    console.log('UNSUBSCRIBE SUCCESS');
    alert('Berhasil unsubscribe!');
  } catch (error) {
    console.error(error);
    alert('Unsubscribe gagal');
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}