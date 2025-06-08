export function showNotification(title, options = {}) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
                reg.showNotification(title, options);
            }
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                navigator.serviceWorker.getRegistration().then(reg => {
                    if (reg) {
                        reg.showNotification(title, options);
                    }
                });
            }
        });
    }
}
