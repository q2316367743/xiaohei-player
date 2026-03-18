const {spawn} = require('node:child_process');

const inject = require("./inject");
const registerMcp = require('./mcp');
const {setupServer, getServerPort} = require("./server");

// 启动服务器
setupServer();
// 注入命令
window.__TAURI_INTERNALS__ = inject('main', {
  ffmpeg_command: (arg) => {
    const {cmd, args} = arg;
    if (cmd) {
      return new Promise((resolve, reject) => {
        const r = spawn(cmd, args, {});
        let stdout = '';
        let stderr = '';
        
        r.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        r.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        r.on('close', (code) => {
          if (code === 0) {
            resolve(stdout);
          } else {
            reject(stderr);
          }
        });
        
        r.on('error', (error) => {
          reject({ error: error.message, stdout, stderr });
        });
      });
    }
    return utools.runFFmpeg(args);
  },
  get_server_port: async () => {
    return getServerPort();
  }
});
// 注册 mcp
registerMcp(window.__TAURI_INTERNALS__.invoke);
