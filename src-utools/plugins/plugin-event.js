const {ipcRenderer} = require('electron');

/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {ArrayBuffer | Uint8Array} 参数
 * @param browserWindowMap {Map<string, BrowserWindow.WindowInstance>}
 * @param eventEmitter {import("./core/TaskEventEmitter").TaskEventEmitter} 触发器
 */
module.exports = async (cmd, args, browserWindowMap, eventEmitter) => {
  // plugin:event|listen
  if (cmd === 'plugin:event|listen') {
    const {event, handler} = args;
    eventEmitter.on(event, handler);
  } else if (cmd === 'plugin:event|unlisten') {
    // 取消注册
    const {event, eventId} = args;
    eventEmitter.off(event, eventId);
  } else if (cmd === 'plugin:event|emit') {
    const {event, payload} = args
    // 同步发送 ipc 事件
    browserWindowMap.forEach((v) => {
      ipcRenderer.sendTo(v.id, 'tauri', {event, payload});
    })
  }
}