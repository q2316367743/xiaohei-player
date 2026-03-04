const Database = require('better-sqlite3');
const {mkdir} = require('node:fs/promises');
const {existsSync} = require('node:fs');
const {dirname, join} = require('node:path');
const os =require ('node:os') ;

const platform = os.platform(); // 如 'darwin', 'win32', 'linux'
const arch = os.arch();         // 如 'arm64', 'x64', 'ia32'

/**
 * 数据库缓存
 * @type {Map<string, Database>}
 */
const map = new Map();

/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 */
module.exports = async (cmd, args) => {
  if (cmd === 'plugin:sql|load') {
    const {db} = args;
    const path = `${db}`.replace("sqlite:", "");
    if (!existsSync(path)) {
      await mkdir(dirname(path), {recursive: true});
    }
    const database = new Database(path, {
      nativeBinding: join(__dirname, '..', 'lib', `better-sqlite3-${platform}-${arch}.node`)
    });
    map.set(path, database);
    return path;
  } else if (cmd === 'plugin:sql|execute') {
    const {db, query, values} = args;
    const database = map.get(db);
    const statements = `${query}`.split(";").map(e => e.trim()).filter(e => !!e);
    if (statements.length > 1) {
      for (const statement of statements) {
        database.exec(statement);
      }
      return [statements.length, null]
    }

    const update = database.prepare(query);
    const info = update.run(...values);
    return [info.changes, info.lastInsertRowid]

  } else if (cmd === 'plugin:sql|select') {
    const {db, query, values} = args;
    const database = map.get(db);
    const update = database.prepare(query);
    return update.all(...values);
  } else if (cmd === 'plugin:sql|close') {
    await map.get(args.db)?.close();
    map.delete(args.db);
  }
}