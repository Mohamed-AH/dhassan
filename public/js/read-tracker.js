/**
 * Read Tracker - Manages read/unread status for lessons
 * Features:
 * - Cloud sync for logged-in users
 * - Local storage fallback for logged-out users
 * - Automatic sync when user logs in
 * - Subtle UI indicators with smooth transitions
 */

class ReadTracker {
  constructor() {
    this.readLessons = new Set();
    this.isLoggedIn = false;
    this.hasShownLoginPrompt = false;
    this.syncInProgress = false;
    this.initPromise = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the read tracker
   * @param {boolean} isLoggedIn - Whether the user is currently logged in
   */
  async init(isLoggedIn = false) {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      this.isLoggedIn = isLoggedIn;

      if (this.isLoggedIn) {
        // User is logged in - fetch from cloud
        await this.loadFromCloud();
        // Sync any local storage data if exists
        await this.syncLocalToCloud();
      } else {
        // User is logged out - load from local storage
        this.loadFromLocalStorage();
      }

      // Initialize UI for all lesson cards on the page
      this.initializeUI();

      this.isInitialized = true;
    })();

    return this.initPromise;
  }

  /**
   * Wait for initialization to complete
   */
  async waitForInit() {
    if (this.isInitialized) return;
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Load read lessons from cloud (for logged-in users)
   */
  async loadFromCloud() {
    try {
      const response = await fetch('/api/user/read-lessons');
      const data = await response.json();

      if (data.success && Array.isArray(data.readLessons)) {
        this.readLessons = new Set(data.readLessons);
      }
    } catch (error) {
      console.error('Error loading read lessons from cloud:', error);
      // Fallback to local storage if cloud fetch fails
      this.loadFromLocalStorage();
    }
  }

  /**
   * Load read lessons from local storage (for logged-out users)
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('readLessons');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.readLessons = new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading from local storage:', error);
      this.readLessons = new Set();
    }
  }

  /**
   * Save read lessons to local storage
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('readLessons', JSON.stringify([...this.readLessons]));
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  }

  /**
   * Sync local storage data to cloud when user logs in
   */
  async syncLocalToCloud() {
    if (this.syncInProgress) return;

    try {
      const localData = localStorage.getItem('readLessons');
      if (!localData) return;

      const localReadLessons = JSON.parse(localData);
      if (!Array.isArray(localReadLessons) || localReadLessons.length === 0) return;

      this.syncInProgress = true;

      const response = await fetch('/api/user/sync-read-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readLessons: localReadLessons })
      });

      const data = await response.json();

      if (data.success) {
        // Update with merged data from server
        this.readLessons = new Set(data.readLessons);
        // Clear local storage as it's now in cloud
        localStorage.removeItem('readLessons');
        // Refresh UI
        this.initializeUI();
      }
    } catch (error) {
      console.error('Error syncing to cloud:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Initialize UI indicators for all lesson cards
   */
  initializeUI() {
    // Find all lesson cards and add read indicators
    document.querySelectorAll('[data-lesson-id]').forEach(card => {
      const lessonId = card.getAttribute('data-lesson-id');
      const indicator = card.querySelector('.read-indicator');

      if (indicator) {
        const isRead = this.readLessons.has(lessonId);
        this.updateIndicatorUI(indicator, isRead);

        // Attach click event listener (remove any existing listeners first)
        // Use a new function reference each time to avoid duplicates
        indicator.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleRead(lessonId, indicator);
        };
      }
    });
  }

  /**
   * Update the visual state of a read indicator
   * @param {HTMLElement} indicator - The indicator element
   * @param {boolean} isRead - Whether the lesson is read
   */
  updateIndicatorUI(indicator, isRead) {
    if (isRead) {
      indicator.classList.add('read');
      indicator.classList.remove('unread');
      indicator.setAttribute('title', 'Mark as unread');
    } else {
      indicator.classList.add('unread');
      indicator.classList.remove('read');
      indicator.setAttribute('title', 'Mark as read');
    }
  }

  /**
   * Toggle read status for a lesson
   * @param {string} lessonId - The lesson ID (format: seriesId/lessonNumber)
   * @param {HTMLElement} indicator - The indicator element
   */
  async toggleRead(lessonId, indicator) {
    // Wait for initialization to complete
    await this.waitForInit();

    const wasRead = this.readLessons.has(lessonId);
    const newReadState = !wasRead;

    // Optimistic UI update
    if (newReadState) {
      this.readLessons.add(lessonId);
    } else {
      this.readLessons.delete(lessonId);
    }
    this.updateIndicatorUI(indicator, newReadState);

    if (this.isLoggedIn) {
      // User is logged in - update cloud
      try {
        const [seriesId, lessonNumber] = lessonId.split('/');
        const response = await fetch(`/api/lessons/${seriesId}/${lessonNumber}/toggle-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!data.success) {
          // Revert on error
          if (wasRead) {
            this.readLessons.add(lessonId);
          } else {
            this.readLessons.delete(lessonId);
          }
          this.updateIndicatorUI(indicator, wasRead);
          console.error('Failed to toggle read status');
        }
      } catch (error) {
        // Revert on error
        if (wasRead) {
          this.readLessons.add(lessonId);
        } else {
          this.readLessons.delete(lessonId);
        }
        this.updateIndicatorUI(indicator, wasRead);
        console.error('Error toggling read status:', error);
      }
    } else {
      // User is logged out - save to local storage
      this.saveToLocalStorage();

      // Show login prompt (only once per session)
      if (!this.hasShownLoginPrompt) {
        this.showLoginPrompt();
        this.hasShownLoginPrompt = true;
      }
    }
  }

  /**
   * Mark a lesson as read (used for auto-marking when viewing lesson)
   * @param {string} lessonId - The lesson ID
   */
  async markAsRead(lessonId) {
    // Wait for initialization to complete
    await this.waitForInit();

    if (this.readLessons.has(lessonId)) {
      return; // Already marked
    }

    this.readLessons.add(lessonId);

    if (this.isLoggedIn) {
      // Update cloud
      try {
        const [seriesId, lessonNumber] = lessonId.split('/');

        const response = await fetch(`/api/lessons/${seriesId}/${lessonNumber}/toggle-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!data.success) {
          console.error('Error marking lesson as read:', data);
        }
      } catch (error) {
        console.error('Error marking lesson as read:', error);
      }
    } else {
      // Save to local storage
      this.saveToLocalStorage();
    }
  }

  /**
   * Check if a lesson is marked as read
   * @param {string} lessonId - The lesson ID
   * @returns {boolean}
   */
  isRead(lessonId) {
    return this.readLessons.has(lessonId);
  }

  /**
   * Show login prompt toast
   */
  showLoginPrompt() {
    const toast = document.createElement('div');
    toast.className = 'login-toast';
    toast.innerHTML = `
      <div class="login-toast-content">
        <span>Sign in to sync your progress across devices</span>
        <div class="login-toast-actions">
          <a href="/login" class="login-toast-btn">Sign In</a>
          <button class="login-toast-close">✕</button>
        </div>
      </div>
    `;

    document.body.appendChild(toast);

    // Attach close button event listener
    const closeBtn = toast.querySelector('.login-toast-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      };
    }

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }
    }, 10000);
  }
}

// Initialize global instance
const readTracker = new ReadTracker();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in by checking if user data exists
    const isLoggedIn = document.body.getAttribute('data-user-logged-in') === 'true';
    readTracker.init(isLoggedIn);
  });
} else {
  const isLoggedIn = document.body.getAttribute('data-user-logged-in') === 'true';
  readTracker.init(isLoggedIn);
}

// Export for global access
window.readTracker = readTracker;
