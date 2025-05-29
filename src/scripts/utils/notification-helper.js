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