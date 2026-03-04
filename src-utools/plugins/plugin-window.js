

// interface WindowOptions {
//     center?: boolean;
//     x?: number;
//     y?: number;
//     width?: number;
//     height?: number;
//     minWidth?: number;
//     minHeight?: number;
//     maxWidth?: number;
//     maxHeight?: number;
//     preventOverflow?: boolean | PreventOverflowMargin;
//     resizable?: boolean;
//     title?: string;
//     fullscreen?: boolean;
//     focus?: boolean;
//     focusable?: boolean;
//     transparent?: boolean;
//     maximized?: boolean;
//     visible?: boolean;
//     decorations?: boolean;
//     alwaysOnTop?: boolean;
//     alwaysOnBottom?: boolean;
//     contentProtected?: boolean;
//     skipTaskbar?: boolean;
//     shadow?: boolean;
//     theme?: Theme;
//     titleBarStyle?: TitleBarStyle;
//     trafficLightPosition?: LogicalPosition;
//     hiddenTitle?: boolean;
//     tabbingIdentifier?: string;
//     maximizable?: boolean;
//     minimizable?: boolean;
//     closable?: boolean;
//     parent?: Window | WebviewWindow | string;
//     visibleOnAllWorkspaces?: boolean;
//     windowEffects?: Effects;
//     backgroundColor?: Color;
//     backgroundThrottling?: BackgroundThrottlingPolicy;
//     javascriptDisabled?: boolean;
//     allowLinkPreview?: boolean;
//     disableInputAccessoryView?: boolean;
//     scrollBarStyle?: ScrollBarStyle;
// }

/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 * @param browserWindowMap {Map<string, BrowserWindow.WindowInstance>}
 */
module.exports = async (cmd, args, browserWindowMap) => {
  if (cmd === 'plugin:window|create') {
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