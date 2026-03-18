/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 */
module.exports = async (cmd, args) => {
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