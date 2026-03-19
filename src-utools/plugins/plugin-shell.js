const {spawn} = require('node:child_process');

const programMap = {
  'xattr-d-apple': 'xattr'
}

/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 */
module.exports = async (cmd, args) => {
  if (cmd === 'plugin:shell|execute') {
    const {
      program,
      args: cmdArgs,
      options
    } = args;

    if (options && options.sidecar) {
      // sidecar 程序
      if (program === 'binaries/ffmpeg') {
        // ffmpeg 程序
        let r = '';
        await utools.runFFmpeg(cmdArgs, {
          onLog(text) {
            r += text;
          }
        });
        return {code: 0, signal: null, stdout: r, stderr: null};
      }
    }

    const r = spawn(programMap[program], cmdArgs, options);
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      
      r.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      r.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      r.on('close', (code) => {
        resolve({code, signal: null, stdout, stderr});
      });
      
      r.on('error', (error) => {
        reject({ error: error.message, stdout, stderr });
      });
    });
  }
}