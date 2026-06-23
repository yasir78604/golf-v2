/**
 * Prize Calculator Service
 * Handles prize pool calculations and distribution
 */

class PrizeCalculator {
  static MONTHLY_FEE = 10;
  static PLATFORM_FEE = 0.20; // 20%
  static CHARITY_MIN = 0.10; // 10%
  static POOL_CONTRIBUTION = 0.70; // 70% to prize pool

  static TIERS = {
    5: 0.40, // Jackpot
    4: 0.35,
    3: 0.25,
  };

  /**
   * Calculate total prize pool and tier breakdown
   * @param {number} activeSubscriberCount
   * @param {number} jackpotRollover - Optional rollover from previous month
   * @returns {Object} { totalPool, tier5, tier4, tier3 }
   */
  static calculatePool(activeSubscriberCount, jackpotRollover = 0) {
    const totalPool = activeSubscriberCount * this.MONTHLY_FEE * this.POOL_CONTRIBUTION + jackpotRollover;

    return {
      totalPool,
      tier5: totalPool * this.TIERS[5],
      tier4: totalPool * this.TIERS[4],
      tier3: totalPool * this.TIERS[3],
      jackpotRollover: jackpotRollover,
    };
  }

  /**
   * Split prize among winners equally
   * @param {number} prizeAmount - Total prize for this tier
   * @param {string[]} winnerIds - Array of user IDs
   * @returns {Array} [{ userId, prizeAmount }]
   */
  static splitPrize(prizeAmount, winnerIds) {
    if (!winnerIds || winnerIds.length === 0) {
      return [];
    }
    const share = prizeAmount / winnerIds.length;
    return winnerIds.map((userId) => ({
      userId,
      prizeAmount: parseFloat(share.toFixed(2)),
    }));
  }

  /**
   * Calculate charity contribution for a user
   * @param {number} subscriptionAmount
   * @param {number} charityPercentage - 10-100
   * @returns {number}
   */
  static calculateCharityContribution(subscriptionAmount, charityPercentage) {
    return subscriptionAmount * (charityPercentage / 100);
  }

  /**
   * Calculate platform fees
   * @param {number} subscriptionAmount
   * @returns {number}
   */
  static calculatePlatformFee(subscriptionAmount) {
    return subscriptionAmount * this.PLATFORM_FEE;
  }
}

module.exports = PrizeCalculator;