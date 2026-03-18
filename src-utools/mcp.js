const {join}  = require('node:path');

/**
 * 注册 MCP 工具
 * @param invoke {(cmd: string, args: any) => Promise<any>} 调用函数
 */
module.exports = (invoke) => {
  const db = join(utools.getPath("appData"), "uTools", "plugins", "xiaohei-player", "db", "main.sqlite");

  utools.registerTool('list_library', async () => {
    const list = await invoke('plugin:sql|select', {
      db: db,
      query: 'select * from library',
      values: []
    });
    console.log(list)
    return list;
  })
}