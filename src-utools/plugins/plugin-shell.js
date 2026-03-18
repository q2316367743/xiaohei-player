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
}