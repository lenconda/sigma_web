export type EventSubscribersType = Record<string, Array<EventSubscriberCallbackType>>;
export type EventSubscriberCallbackType = (data: any) => any;

/**
 * an event emitter based on publisher-subscriber pattern
 * @class
 * @constructor
 */
class Hub {
  private subscribers: EventSubscribersType = {};

  /**
   * emit an event
   * @param key
   * @param data
   */
  public emit(key: string, data: any) {
    const currentSubscribers = this.subscribers[key];
    if (!Array.isArray(currentSubscribers)) {
      return;
    }

    currentSubscribers.forEach(callback => typeof callback === 'function' && callback(data));
  }

  /**
   * register an event handler
   * @param key
   * @param callback
   */
  public on(key: string, callback: EventSubscriberCallbackType) {
    if (!Array.isArray(this.subscribers[key])) {
      this.subscribers[key] = [];
    }

    typeof callback === 'function' && this.subscribers[key].push(callback);
    return callback;
  }

  /**
   * detach an event handler
   * @param key
   * @param callback
   */
  public off(key: string, callback: EventSubscriberCallbackType) {
    if (!Array.isArray(this.subscribers[key]) || !callback) {
      return;
    }

    this.subscribers[key] = this.subscribers[key].filter(currentCallback => currentCallback !== callback);
  }

  /**
   * check if there is the same handler in subscribers
   * @param key
   * @returns
   */
  public has(key: string, callback: EventSubscriberCallbackType) {
    const currentSubscribers = this.subscribers[key];
    if (callback) {
      return Array.isArray(currentSubscribers) && currentSubscribers.includes(callback);
    }
    return Array.isArray(currentSubscribers) && currentSubscribers.length > 0;
  }
}

export default Hub;
