import {
    VAPID_PUBLIC_KEY
} from '../config';
import {
    convertBase64ToUint8Array
} from './index';

import {
    subscribePushNotification,
    unsubscribePushNotification
} from '../data/api';

export class NotificationHelper {
    static showToast(message, isError = false) {
        const toast = document.createElement("div");
        toast.className = `notification ${isError ? "error" : ""}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

export function isNotificationAvailable() {
    return 'Notification' in window;
}

export function isNotificationGranted() {
    return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
    if (!isNotificationAvailable()) {
        console.error('Notification API unsupported.');
        return false;
    }

    if (isNotificationGranted()) {
        return true;
    }

    const status = await Notification.requestPermission();

    if (status === 'denied') {
        alert('Izin notifikasi ditolak.');
        return false;
    }

    if (status === 'default') {
        alert('Izin notifikasi ditutup atau diabaikan.');
        return false;
    }

    return true;
}

export async function getPushSubscription() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
        console.warn('Service Worker registration tidak ditemukan.');
        return null;
    }
    return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
    const subscription = await getPushSubscription();
    return subscription !== null;
}

export function generateSubscribeOptions() {
    return {
        userVisibleOnly: true,
        applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
    };
}

export async function subscribe() {
    if (!(await requestNotificationPermission())) {
        return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
        alert('Service worker belum terdaftar. Pastikan service worker sudah terdaftar sebelum berlangganan notifikasi.');
        return;
    }

    if (await isCurrentPushSubscriptionAvailable()) {
        alert('Sudah berlangganan push notification.');
        return;
    }

    console.log('Mulai berlangganan push notification...');

    const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
    const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';

    let pushSubscription;

    try {
        pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

        const {
            endpoint,
            keys
        } = pushSubscription.toJSON();

        const response = await subscribePushNotification({
            endpoint,
            keys
        });

        if (response && response.ok) {
            alert(successSubscribeMessage);
        } else {
            const text = await response ?.text ?.();
            console.error('subscribe: response not OK:', text);
            alert(failureSubscribeMessage);
            await pushSubscription.unsubscribe();
        }
    } catch (error) {
        console.error('subscribe: error:', error);
        alert(failureSubscribeMessage);
        if (pushSubscription) {
            await pushSubscription.unsubscribe();
        }
    }
}

export async function unsubscribe() {
    const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
    const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

    try {
        const pushSubscription = await getPushSubscription();

        if (!pushSubscription) {
            alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
            return;
        }

        const { endpoint } = pushSubscription.toJSON();

        const response = await unsubscribePushNotification({endpoint});
        
        if (response && response.ok) {
            alert(successUnsubscribeMessage);
        } else {
            const text = await response?.text?.();
            console.error('unsubscribe: response not OK:', text);
            alert(failureUnsubscribeMessage);
        }

        const unsubscribed = await pushSubscription.unsubscribe();
        
        if (!unsubscribed) {
            alert(failureUnsubscribeMessage);
            console.error('Gagal unsubscribe dari pushManager.');
            return;
        }

    } catch (error) {
        console.error('unsubscribe: error:', error);
        alert(failureUnsubscribeMessage);
    }
}
