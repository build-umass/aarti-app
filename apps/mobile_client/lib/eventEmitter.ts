// Simple custom event emitter that works on all platforms
class SimpleEventEmitter {
  private listeners: { [key: string]: Array<(...args: any[]) => void> } = {};

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    console.log(`Event listener added for: ${event}`);
  }

  off(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    console.log(`Event listener removed for: ${event}`);
  }

  emit(event: string, ...args: any[]) {
    console.log(`Event emitted: ${event}`, args);
    if (!this.listeners[event]) {
      console.log(`No listeners for event: ${event}`);
      return;
    }
    this.listeners[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// Event emitter for cross-component communication
export const appEvents = new SimpleEventEmitter();

// Event types
export const EVENT_TYPES = {
  QUIZ_PROGRESS_UPDATED: 'quiz_progress_updated',
  BOOKMARKS_UPDATED: 'bookmarks_updated',
  USERNAME_UPDATED: 'username_updated',
  DATA_RESET: 'data_reset',
} as const;
