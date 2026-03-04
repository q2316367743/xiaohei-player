class TaskEventEmitter {

  /**
   * 创建任务事件发射器
   * @param eventMap {Map<string, Function>} 事件映射
   */
  constructor(eventMap) {
    // 使用 null 原型对象，避免与 Object.prototype 冲突（如 hasOwnProperty 等）
    this.events = Object.create(null);
    this.eventMap = eventMap;
  }

  /**
   * 订阅事件
   * @param {string} eventName - 事件名称
   * @param {string} eventId - 回调函数ID
   */
  on(eventName, eventId) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(eventId);
    return this; // 支持链式调用
  }

  /**
   * 一次性订阅（触发后自动移除）
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  once(eventName, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    const wrapped = (...args) => {
      callback(...args);
      this.off(eventName, wrapped);
    };
    return this.on(eventName, wrapped);
  }

  /**
   * 发布事件
   * @param {string} eventName - 事件名称
   * @param {...any} args - 传递给回调的参数
   */
  emit(eventName, ...args) {
    const callbacks = this.events[eventName];
    if (!callbacks || callbacks.length === 0) return false;

    // 复制一份回调列表，防止在执行过程中被修改（如 off 或 once）
    const callbacksCopy = [...callbacks];
    let success = true;

    for (const cb of callbacksCopy) {
      try {
        // 触发函数
        this.eventMap.get(cb)?.(...args)
      } catch (err) {
        console.error(`Error in event "${eventName}" listener:`, err);
        success = false;
      }
    }
    return success;
  }

  /**
   * 取消订阅
   * @param {string} eventName - 事件名称
   * @param {string?} eventId - 可选，指定要移除的回调；若不传，则清空该事件所有监听器
   */
  off(eventName, eventId) {
    if (!this.events[eventName]) return this;

    if (eventId === undefined) {
      // 清空该事件所有监听器
      delete this.events[eventName];
    } else {
      // 移除特定回调
      const index = this.events[eventName].indexOf(eventId);
      if (index > -1) {
        this.events[eventName].splice(index, 1);
        // 如果没有监听器了，可以清理 key（可选）
        if (this.events[eventName].length === 0) {
          delete this.events[eventName];
        }
      }
    }
    return this;
  }
}

module.exports = {
  TaskEventEmitter
}