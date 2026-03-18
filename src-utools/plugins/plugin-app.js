/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 */
module.exports = async (cmd, args) => {
  if (cmd === 'plugin:app|set_app_theme') {
    console.log('设置主题');
  }
}