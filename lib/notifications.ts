import User from '@/models/User';

export async function createNotification(userId: string, data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'promo' | 'rank';
    link?: string;
}) {
    try {
        await User.findByIdAndUpdate(userId, {
            $push: {
                notifications: {
                    ...data,
                    createdAt: new Date(),
                    isRead: false
                }
            }
        });
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
}
