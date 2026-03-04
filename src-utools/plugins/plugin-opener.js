// async function revealItemInDir(path) {
//     const paths = typeof path === 'string' ? [path] : path;
//     return invoke('plugin:opener|reveal_item_in_dir', { paths });
// }

module.exports = (cmd, args) => {
  if (cmd === 'plugin:opener|open_url') {
    const {url} = args;
    utools.shellOpenExternal(url);
    return Promise.resolve();
  }else if (cmd === 'plugin:opener|reveal_item_in_dir') {
    /** @type {Array<string>} */
    const {paths} = args;
    for (const path of paths) {
      utools.shellShowItemInFolder(path)
    }
    return Promise.resolve();
  }
}