const fs = require('node:fs/promises');
const {existsSync} = require('node:fs');

/**
 * 读取文件并返回 ArrayBuffer
 * @param {string} filePath - 文件路径
 * @returns {Promise<ArrayBuffer>}
 */
async function readFileAsArrayBuffer(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    // Buffer 可以直接通过 .buffer 属性获取 ArrayBuffer
    // 注意：需处理 Buffer 的偏移和长度（避免共享底层内存问题）
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  } catch (err) {
    throw new Error(`读取文件失败: ${err.message}`);
  }
}

/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {ArrayBuffer | Uint8Array} 参数
 * @param options {Record<string, any>} 选项
 */
module.exports = async (cmd, args, options) => {
  if (cmd === 'plugin:fs|read_text_file') {
    const {path} = args;
    return await readFileAsArrayBuffer(Array.isArray(path) ? path[0] : path);
  }
  else if (cmd === 'plugin:fs|write_text_file') {
    return await fs.writeFile(
      decodeURIComponent(options.headers.path),
      Buffer.from(args instanceof Uint8Array ? args : new Uint8Array(args)),
      {
        encoding: 'utf-8'
      });
  }
  else if (cmd === 'plugin:fs|read_dir') {
    const {path} = args;
    const items = await fs.readdir(path);
    const entries = [];
    for (let item of items) {
      const stats = await fs.stat(path + "/" + item);
      entries.push({
        name: item,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        isSymlink: stats.isSymbolicLink()
      })
    }
    return entries;
  }
  else if (cmd === 'plugin:fs|mkdir') {
    const {path, options} = args;
    return await fs.mkdir(path, {
      recursive: options.recursive,
      mode: options.mode
    });
  }
  else if (cmd === 'plugin:fs|exists') {
    const {path} = args;
    return existsSync(path);
  }
  else if (cmd === 'plugin:fs|remove') {
    const {path} = args;
    await fs.unlink(path)
  }
  else if (cmd === 'plugin:fs|rename') {
    const {oldPath, newPath} = args;
    await fs.rename(oldPath, newPath);
  }
  else if (cmd === 'plugin:fs|write_file') {
    const {headers} = options;
    const {path, options} = headers;
    const o = JSON.parse(options);
    if (o.createNew) {
      if (existsSync(path)) {
        // 删除
        await fs.unlink(path);
      }
    }
    await fs.writeFile(
      path,
      Buffer.from(args instanceof Uint8Array ? args : new Uint8Array(args))
      , {
        mode: o.mode,
        encoding: "binary",
      })
  }
}