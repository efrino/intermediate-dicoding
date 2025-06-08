import CONFIG from '../config';
import { getUserData } from './index.js';
import { NotificationHelper } from './notification-helper.js'; // asumsi sudah ada

const applicationServerKey = urlBase64ToUint8Array(
    'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
);

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function subscribePushNotification() {
    try {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
        });

        const { token } = getUserData();

        const p256dh = subscription.getKey('p256dh');
        const auth = subscription.getKey('auth');

        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
                auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
            },
        };

        const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(pushSubscription),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        NotificationHelper.showToast('Berhasil berlangganan notifikasi');
        return result;
    } catch (error) {
        NotificationHelper.showToast(`Gagal subscribe: ${error.message}`, true);
        throw error;
    }
}

export async function unsubscribePushNotification() {
    try {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.getSubscription();

        if (!subscription) throw new Error('Tidak ada subscription untuk dihapus.');

        const { token } = getUserData();
        const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        await subscription.unsubscribe();

        NotificationHelper.showToast('Berhasil berhenti berlangganan notifikasi');
        return result;
    } catch (error) {
        NotificationHelper.showToast(`Gagal unsubscribe: ${error.message}`, true);
        throw error;
    }
}
