export type EventSubscribersType<T> = Record<string, Array<EventSubscriberCallbackType<T>>>;
export type EventSubscriberCallbackType<T> = (data: T) => any;

/**
 * an event emitter based on publisher-subscriber pattern
 * @class
 * @constructor
 */
class Bus<T> {
  public subscribers: EventSubscribersType<T> = {};

  /**
   * emit an event
   * @param key
   * @param data
   */
  public emit(key: string, data: T) {
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
  public on(key: string, callback: EventSubscriberCallbackType<T>) {
    if (!Array.isArray(this.subscribers[key])) {
      this.subscribers[key] = [];
    }

    if (
      typeof callback === 'function'
      && this.subscribers[key].findIndex(subscriber => subscriber === callback) === -1
    ) {
      this.subscribers[key].push(callback);
    }

    return callback;
  }

  /**
   * detach an event handler
   * @param key
   * @param callback
   */
  public off(key: string, callback: EventSubscriberCallbackType<T>) {
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
  public has(key: string, callback: EventSubscriberCallbackType<T>) {
    const currentSubscribers = this.subscribers[key];
    if (callback) {
      return Array.isArray(currentSubscribers) && currentSubscribers.includes(callback);
    }
    return Array.isArray(currentSubscribers) && currentSubscribers.length > 0;
  }
}

export default Bus;
