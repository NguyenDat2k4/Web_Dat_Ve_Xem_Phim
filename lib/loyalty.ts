import User from '@/models/User';

export const RANKS = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  DIAMOND: 'Kim Cương',
};

export const RANK_THRESHOLDS = {
  SILVER: 1000000,
  GOLD: 5000000,
  DIAMOND: 10000000,
  MAX: 20000000
};

/**
 * Calculates the new rank based on total spent
 */
export function calculateRank(totalSpent: number): string {
  if (totalSpent >= RANK_THRESHOLDS.DIAMOND) return RANKS.DIAMOND;
  if (totalSpent >= RANK_THRESHOLDS.GOLD) return RANKS.GOLD;
  if (totalSpent >= RANK_THRESHOLDS.SILVER) return RANKS.SILVER;
  return RANKS.BRONZE;
}

/**
 * Processes loyalty points and rank updates for a user after a successful booking
 */
export async function processLoyaltyUpdate(userEmail: string, totalPrice: number, pointsUsed: number) {
  if (!userEmail) return;

  const pointsEarned = Math.round(totalPrice * 0.05); // 5% reward
  const netPointsChange = pointsEarned - pointsUsed;

  const user = await User.findOne({ email: userEmail });
  if (!user) return;

  const oldRank = user.rank;
  const newTotalSpent = (user.totalSpent || 0) + totalPrice;
  const newRank = calculateRank(newTotalSpent);

  await User.findOneAndUpdate(
    { email: userEmail },
    { 
      $inc: { points: netPointsChange, totalSpent: totalPrice },
      $set: { rank: newRank }
    }
  );

  // Thêm thông báo nếu thăng hạng
  if (newRank !== oldRank) {
      const { createNotification } = await import('./notifications');
      await createNotification(user._id.toString(), {
          title: 'Chúc mừng thăng hạng!',
          message: `Bạn đã được thăng hạng lên thành viên ${newRank}. Hãy tận hưởng các ưu đãi mới nhé!`,
          type: 'rank',
          link: '/profile'
      });
  }

  return { pointsEarned, newRank };
}
