const {
  join,
  basename,
  extname,
  isAbsolute,
  normalize,
  resolve
} = require("node:path");

/**
 * 获取目录
 * @param directory 目录编码
 * @return {Promise<string>}  目录
 */
const getDirectory = (directory) => {
  switch (directory) {
    case 1:
      return Promise.resolve(utools.getPath("music"));
    case 2:
      return Promise.resolve(utools.getPath("cache"));
    case 3:
      return Promise.resolve(utools.getPath("config"));
    case 4:
      return Promise.resolve(utools.getPath("userData"));
    case 5:
      return Promise.resolve(utools.getPath("localData"));
    case 6:
      return Promise.resolve(utools.getPath("documents"));
    case 7:
      return Promise.resolve(utools.getPath("downloads"));
    case 8:
      return Promise.resolve(utools.getPath("pictures"));
    case 9:
      return Promise.resolve(utools.getPath("public"));
    case 10:
      return Promise.resolve(utools.getPath("videos"));
    case 11:
      return Promise.resolve(join(__dirname, '..', 'resource'));
    case 12:
      return Promise.resolve(utools.getPath("temp"));
    case 13:
      return Promise.resolve(utools.getPath("appConfig"));
    case 14:
      return Promise.resolve(join(utools.getPath("appData"), "uTools", "plugins", "xiaohei-player"));
    case 15:
      return Promise.resolve(utools.getPath("appLocalData"));
    case 16:
      return Promise.resolve(utools.getPath("appCache"));
    case 17:
      return Promise.resolve(utools.getPath("appLog"));
    case 18:
      return Promise.resolve(utools.getPath("desktop"));
    case 19:
      return Promise.resolve(utools.getPath("executable"));
    case 20:
      return Promise.resolve(utools.getPath("font"));
    case 21:
      return Promise.resolve(utools.getPath("home"));
    case 22:
      return Promise.resolve(utools.getPath("runtime"));
    case 23:
      return Promise.resolve(utools.getPath("template"));
    default:
      return Promise.resolve(join(utools.getPath("appData"), "uTools", "plugins", "xiaohei-player"));
  }
}

/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 */
module.exports = async (cmd, args) => {
  if (cmd === 'plugin:path|join') {
    const {paths} = args;
    return join(...paths);
  } else if (cmd === 'plugin:path|resolve_directory') {
    const {path, directory} = args;
    const dir = await getDirectory(directory);
    if (!path) {
      return dir;
    } else if (!directory) {
      return resolve(__dirname, path);
    }
    return join(dir, path);
  } else if (cmd === 'plugin:path|basename') {
    const {path} = args;
    return basename(path)
  } else if (cmd === 'plugin:path|extname') {
    const {path} = args;
    return extname(path)
  } else if (cmd === 'plugin:path|is_absolute') {
    const {path} = args;
    return isAbsolute(path)
  } else if (cmd === 'plugin:path|normalize') {
    const {path} = args;
    return normalize(path)
  } else if (cmd === 'plugin:path|resolve') {
    const {path} = args;
    return resolve(path)
  }
}