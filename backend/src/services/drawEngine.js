/**
 * Draw Engine Service
 * Handles number generation and winner matching for monthly draws
 */

class DrawEngine {
  #freq = Array(46).fill(0);

  constructor(scores) {
    // Build frequency map from all scores
    scores.forEach((p) => {
      if (p >= 1 && p <= 45) this.#freq[p]++;
    });
  }

  /**
   * Get weights based on selected logic
   */
  #getWeights(logic) {
    const weights = {};
    for (let i = 1; i <= 45; i++) {
      if (logic === 'random') {
        weights[i] = 1;
      } else if (logic === 'weighted_popular') {
        weights[i] = this.#freq[i] + 1;
      } else if (logic === 'weighted_underdog') {
        weights[i] = 1 / (this.#freq[i] + 0.1);
      }
    }
    return weights;
  }

  /**
   * Generate N unique numbers using weighted random selection
   */
  generateNumbers(logic, count = 5) {
    const weights = this.#getWeights(logic);
    const result = [];
    const temp = { ...weights };

    for (let i = 0; i < count; i++) {
      const total = Object.values(temp).reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;

      for (const [num, weight] of Object.entries(temp)) {
        rand -= weight;
        if (rand <= 0) {
          result.push(Number(num));
          delete temp[num];
          break;
        }
      }
    }
    return result;
  }

  /**
   * Match users' scores against draw numbers
   * @param {Array} usersWithScores - [{ userId, scores: [points] }]
   * @param {number[]} drawNumbers
   * @returns {Object} { 5: [userIds], 4: [userIds], 3: [userIds] }
   */
  static matchWinners(usersWithScores, drawNumbers) {
    const drawSet = new Set(drawNumbers);
    const winners = { 5: [], 4: [], 3: [] };

    for (const entry of usersWithScores) {
      const userScores = entry.scores.slice(0, 5);
      const matches = userScores.filter((n) => drawSet.has(n)).length;
      if (matches >= 3) {
        winners[matches].push(entry.userId);
      }
    }
    return winners;
  }

  /**
   * Calculate number of matches for a single user
   */
  static getMatchCount(userScores, drawNumbers) {
    const drawSet = new Set(drawNumbers);
    return userScores.filter((n) => drawSet.has(n)).length;
  }
}

module.exports = DrawEngine;