export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const sendLocalNotification = (title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    // Use Service Worker registration if available for better background support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                vibrate: [200, 100, 200],
                tag: 'budget-alert'
            } as any);
        });
    } else {
        new Notification(title, { body });
    }
};

export const checkBudgetThresholds = (
    category: string,
    spent: number,
    limit: number,
    previousSpent: number
) => {
    if (limit <= 0) return;

    const threshold80 = limit * 0.8;
    const threshold100 = limit;

    // Alert for 80%
    if (spent >= threshold80 && previousSpent < threshold80 && spent < threshold100) {
        sendLocalNotification(
            'Budget Warning',
            `You've used 80% of your ${category} budget ($${spent.toFixed(2)} / $${limit.toFixed(2)}).`
        );
    }

    // Alert for 100%
    if (spent >= threshold100 && previousSpent < threshold100) {
        sendLocalNotification(
            'Budget Exceeded',
            `You've hit your ${category} budget limit! ($${spent.toFixed(2)} / $${limit.toFixed(2)}).`
        );
    }
};
