const inject = require("./inject");
// const registerMcp = require('./mcp');
const {setupServer, getServerPort} = require("./server");

// 启动服务器
setupServer();
// 注入命令
window.__TAURI_INTERNALS__ = inject('main', {
  get_server_port: async () => {
    return getServerPort();
  }
});
// 注册 mcp
// registerMcp(window.__TAURI_INTERNALS__.invoke);
