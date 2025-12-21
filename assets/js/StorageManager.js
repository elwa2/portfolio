/**
 * StorageManager.js
 * Handles all local data persistence using IndexedDB.
 * Manages user preferences, theme settings, and gamification state.
 */
class StorageManager {
  constructor() {
    this.dbName = "PortfolioDB";
    this.dbVersion = 1;
    this.db = null;
    this.readyPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error("StorageManager: Database error", event.target.error);
        reject("Database error");
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("StorageManager: Database initialized");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store for User Preferences (Theme, Sidebar, etc.)
        if (!db.objectStoreNames.contains("preferences")) {
          db.createObjectStore("preferences", { keyPath: "key" });
        }

        // Store for Gamification (XP, Badges, Unlocks)
        if (!db.objectStoreNames.contains("gamification")) {
          db.createObjectStore("gamification", { keyPath: "key" });
        }
      };
    });
  }

  /**
   * Generic ensure-ready wrapper
   */
  async ensureReady() {
    if (!this.db) await this.readyPromise;
  }

  /**
   * Save a preference value
   * @param {string} key
   * @param {any} value
   */
  async setPref(key, value) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["preferences"], "readwrite");
      const store = transaction.objectStore("preferences");
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a preference value
   * @param {string} key
   * @param {any} defaultValue
   */
  async getPref(key, defaultValue = null) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["preferences"], "readonly");
      const store = transaction.objectStore("preferences");
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save gamification state
   * @param {string} key
   * @param {any} value
   */
  async setGameState(key, value) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["gamification"], "readwrite");
      const store = transaction.objectStore("gamification");
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get gamification state
   * @param {string} key
   * @param {any} defaultValue
   */
  async getGameState(key, defaultValue = null) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["gamification"], "readonly");
      const store = transaction.objectStore("gamification");
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Updates user XP
   * @param {number} amount
   */
  async addXP(amount) {
    const currentXP = await this.getGameState("userXP", 0);
    const newXP = currentXP + amount;
    await this.setGameState("userXP", newXP);
    return newXP; // Return new XP for UI updates
  }
}

// Export a singleton instance
window.storageManager = new StorageManager();
