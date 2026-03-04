


/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 * @param browserWindowMap {Map<string, BrowserWindow.WindowInstance>}
 */
module.exports = async (cmd, args, browserWindowMap) => {
  if (cmd === 'plugin:webview|create_webview_window') {
    const {options} = args;
    await new Promise(resolve => {
      const bw = utools.createBrowserWindow(options.url, options, () => {
        // 创建完成
        resolve();
      })
      browserWindowMap.set(options.label, bw);
    })
  }
}