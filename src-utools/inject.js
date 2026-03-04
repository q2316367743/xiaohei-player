const sql = require('./plugins/plugin-sql');
const path = require('./plugins/plugin-path');
const opener = require('./plugins/plugin-opener');
const dialog = require('./plugins/plugin-dialog');
const fs = require('./plugins/plugin-fs');
const store = require('./plugins/plugin-store');
const win = require("./plugins/plugin-window");
const webview = require('./plugins/plugin-webview');
const event = require('./plugins/plugin-event');
const {TaskEventEmitter} = require("./core/TaskEventEmitter");
const {ipcRenderer} = require('electron');


window.__TAURI_OS_PLUGIN_INTERNALS__ = {
  // 'linux', 'macos', 'ios', 'freebsd', 'dragonfly', 'netbsd', 'openbsd', 'solaris', 'android', 'windows'
  platform: () => {
    if (utools.isLinux()) return 'linux';
    if (utools.isMacOS()) return 'macos';
    if (utools.isWindows()) return 'windows';
    return 'unknown';
  }
}

window.isTauri = false;

/** @type {Map<string, BrowserWindow.WindowInstance>} */
const browserWindowMap = new Map();
/**
 * @type {Map<string, Function>}
 */
const eventMap = new Map();
const eventEmitter = new TaskEventEmitter(eventMap);

module.exports = (label) => {

  ipcRenderer.on('tauri', (_e, message) => {
    const {event, payload} = message

    eventEmitter.emit(event, payload);

  })

  return {

    /**
     * 执行指定命令
     * @param cmd {string} 命令
     * @param args {Record<string, any> | ArrayBuffer | Uint8Array} 参数
     * @param options {{}} 选项
     */
    invoke: (cmd, args, options) => {
      if (cmd.startsWith('plugin:sql')) {
        return sql(cmd, args);
      } else if (cmd.startsWith("plugin:path")) {
        return path(cmd, args);
      } else if (cmd.startsWith("plugin:store")) {
        return store(cmd, args, eventEmitter);
      } else if (cmd.startsWith("plugin:fs")) {
        return fs(cmd, args, options);
      } else if (cmd.startsWith("plugin:opener")) {
        return opener(cmd, args);
      } else if (cmd.startsWith("plugin:dialog")) {
        return dialog(cmd, args);
      } else if (cmd.startsWith("plugin:window")) {
        return win(cmd, args, browserWindowMap);
      }  else if (cmd.startsWith("plugin:event")) {
        return event(cmd, args, browserWindowMap, eventEmitter);
      } else if (cmd.startsWith("plugin:webview")) {
        return webview(cmd, args, browserWindowMap);
      } else if (cmd === 'plugin:log|log') {
        // 插件日志
        const {
          // Trace|Debug|Info|Warn|Error
          level,
          message,
          location,
        } = args;
        const msg = `[${location}] ${message}`;
        if (level === 2) console.debug(msg);
        else if (level === 3) console.info(msg);
        else if (level === 4) console.warn(msg);
        else if (level === 5) console.error(msg);
        else console.trace(msg);
      }
    },
    /**
     * 注册回调
     * @param callback {any} 回调函数
     * @param once {boolean} 是否只执行一次
     * @return {string} 事件 ID
     */
    transformCallback: (callback) => {
      const id = Math.random().toString(32).slice(2);
      eventMap.set(id, () => Promise.resolve(callback()));
      return id;
    },
    convertFileSrc(filePath) {
      return `file:///${filePath}`;
    },
    metadata: {
      currentWindow: {
        label
      }
    },
    plugins: {
      path: {
        delimiter: require('node:path').delimiter,
        sep: require('node:path').sep,
      }
    }
  };
}

