const inject = require("./inject");
const {setupServer, getServerPort} = require("./server");

setupServer()
window.__TAURI_INTERNALS__ = inject('main', {
  ffmpeg_command: (arg) => {
    const {args} = arg;
    return utools.runFFmpeg(args);
  },
  get_server_port: async () => {
    return getServerPort();
  }
});