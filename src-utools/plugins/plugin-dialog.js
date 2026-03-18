/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 */
module.exports = async (cmd, args) => {
  if (cmd === 'plugin:dialog|open') {
    const paths = utools.showOpenDialog({
      ...args.options,
      properties: [
        args.options.directory ? 'openDirectory' : 'openFile',
        args.options.multiple ? 'multiSelections' : 'openFile',
        args.options.canCreateDirectories ? 'createDirectory' : 'openFile'
      ]
    });
    if (args.multiple) return paths;
    else return paths ? paths[0] ? paths[0] : null : null;
  } else if (cmd === 'plugin:dialog|save') {
    const path = utools.showSaveDialog({
      ...args.options,
      properties: [
        'openFile',
        args.options.multiple ? 'multiSelections' : 'openFile',
        args.options.canCreateDirectories ? 'createDirectory' : 'openFile'
      ]
    });
    return path ? path : null;
  }
}