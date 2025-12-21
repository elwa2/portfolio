/**
 * 🎮 GameState - Logic for levels, XP, and rewards
 * Uses psychological principles of "Loss Aversion" and "Variable Rewards".
 */

import { storage } from "./StorageManager.js";

class GameState {
  constructor() {
    this.defaults = {
      id: "current_user",
      xp: 0,
      level: 1,
      nextLevelXp: 100,
      streak: 0,
      lastVisit: null,
      inventory: [],
      unlockedAchievements: [],
    };
    this.state = { ...this.defaults };
    this.onUpdate = []; // Callbacks for UI updates
  }

  async init() {
    const savedState = await storage.get("gameState", "current_user");
    if (savedState) {
      this.state = { ...this.defaults, ...savedState };
    }
    this.checkStreak();
    return this.state;
  }

  /**
   * Subscribe to state updates
   */
  subscribe(callback) {
    this.onUpdate.push(callback);
  }

  /**
   * Add XP and handle leveling up
   */
  async addXp(amount, reason = "") {
    this.state.xp += amount;

    // Level up logic
    let leveledUp = false;
    while (this.state.xp >= this.state.nextLevelXp) {
      this.state.level++;
      this.state.xp -= this.state.nextLevelXp;
      this.state.nextLevelXp = Math.floor(this.state.nextLevelXp * 1.5);
      leveledUp = true;
    }

    await this.save();
    this.notify(leveledUp, reason);
  }

  /**
   * Daily streak logic
   */
  checkStreak() {
    const now = new Date();
    const lastVisit = this.state.lastVisit
      ? new Date(this.state.lastVisit)
      : null;

    if (!lastVisit) {
      this.state.streak = 1;
    } else {
      const diffHours = (now - lastVisit) / (1000 * 60 * 60);
      if (diffHours < 24) {
        // Same day, do nothing or keep streak
      } else if (diffHours < 48) {
        this.state.streak++;
      } else {
        this.state.streak = 1; // Streak broken
      }
    }
    this.state.lastVisit = now.toISOString();
    this.save();
  }

  async save() {
    await storage.set("gameState", this.state);
  }

  notify(leveledUp, reason) {
    this.onUpdate.forEach((cb) => cb(this.state, { leveledUp, reason }));
  }

  // Helper to get progress percentage to next level
  getProgress() {
    return Math.floor((this.state.xp / this.state.nextLevelXp) * 100);
  }

  /**
   * Unlock Achievement (Psychological Validation)
   */
  async unlockAchievement(id, title) {
    if (!this.state.unlockedAchievements.includes(id)) {
      this.state.unlockedAchievements.push(id);
      await this.addXp(200, `إنجاز: ${title}`);
      await this.save();
      return true;
    }
    return false;
  }
}

export const gameState = new GameState();
