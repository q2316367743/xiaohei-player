/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 */
module.exports = (cmd, args) => {
  if (cmd === 'plugin:dialog|open') {
    return Promise.resolve(utools.showOpenDialog({
      ...args.options,
      properties: [
        args.options.directory ? 'openDirectory' : 'openFile',
        args.options.multiple ? 'multiSelections' : 'openFile',
        args.options.canCreateDirectories ? 'createDirectory' : 'openFile'
      ]
    }))
  }else if (cmd === 'plugin:dialog|save') {
    return Promise.resolve(utools.showSaveDialog({
      ...args.options,
      properties: [
        'openFile',
        args.options.multiple ? 'multiSelections' : 'openFile',
        args.options.canCreateDirectories ? 'createDirectory' : 'openFile'
      ]
    }))
  }
}