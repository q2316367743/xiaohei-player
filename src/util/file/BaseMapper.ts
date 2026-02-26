import {logDebug} from "@/lib/log";
import {generatePlaceholders, useSnowflake} from "@/util";
import {SqlBase} from "@/lib/sql.ts";

export interface TableLike extends Record<string, any> {
  id: string;
}

export class BaseMapper<T extends TableLike, N extends string> {
  protected readonly db: SqlBase<N>;
  private readonly tableName: N;

  constructor(tableName: N, db: SqlBase<N>) {
    this.db = db;
    this.tableName = tableName;
  }


  async updateById(id: string, params: Partial<T>) {
    const query = new Array<string>();
    const values = new Array<any>();
    for (const key in params) {
      const value = params[key];
      if (typeof value === "undefined" || value === null) continue;
      query.push(`\`${key}\` = ${generatePlaceholders(1, values.length)}`);
      values.push(value);
    }
    if (query.length === 0) {
      // 没有更新的
      return;
    }
    const sql = `update ${this.tableName} set ${query.join(", ")} where id = ${generatePlaceholders(1, values.length)}`;
    const val = [...values, id];
    logDebug("[sql] update sql:\t\t" + sql);
    logDebug("[sql] update values:\t" + val);
    const r = await this.db.execute(sql, val);
    logDebug("[sql] update result:\t" + r.rowsAffected);
  }

  async deleteById(id: string) {
    const sql = `delete from ${this.tableName} where id = ${generatePlaceholders(1)}`;
    logDebug("[sql] delete sql:\t\t" + sql);
    logDebug("[sql] delete values:\t" + id);
    const r = await this.db.execute(sql, [id]);
    logDebug("[sql] delete result:\t" + r.rowsAffected);
  }

  async deleteByIds(ids: Array<string>) {
    const sql = `delete from ${this.tableName} where id in (${generatePlaceholders(ids.length)})`;
    logDebug("[sql] delete sql:\t\t" + sql);
    logDebug("[sql] delete values:\t" + ids.join(", "));
    const r = await this.db.execute(sql, ids);
    logDebug("[sql] delete result:\t" + r.rowsAffected);
  }

  async insert(params: Partial<Omit<T, "id">>): Promise<T> {
    const query = new Array<string>();
    const values = new Array<any>();
    for (const key in params) {
      if (key === "id") continue;
      query.push(`\`${key}\``);
      values.push((params as any)[key]);
    }
    const sql = `insert into ${this.tableName} (id, ${query.join(
            ", "
    )}) values (${generatePlaceholders(query.length + 1)})`;
    const id = useSnowflake().nextId();
    values.unshift(id)
    logDebug("[sql] insert sql:\t\t" + sql);
    logDebug("[sql] insert values:\t" + JSON.stringify(values));
    const r = await this.db.execute(sql, values);
    logDebug("[sql] insert result:\t" + r.rowsAffected);
    return {
      ...params,
      id
    } as T;
  }

  async insertBatch(params: Array<Partial<Omit<T, "id">>>): Promise<Array<string>> {
    if (params.length === 0) {
      return [];
    }

    // 获取第一个对象的键名（排除id）
    const keys = Object.keys(params[0]!).filter((key) => key !== "id");
    const columnNames = keys.map((key) => `\`${key}\``);

    // 生成所有ID
    const ids: Array<string> = [];
    const allValues: Array<any> = [];

    for (const _param of params) {
      const id = useSnowflake().nextId();
      ids.push(id);

      // 添加ID到值数组的开头
      allValues.push(id);
      // 按键顺序添加其他值
      for (const key of keys) {
        allValues.push(_param[key]);
      }
    }

    // 构建SQL语句
    const valuePlaceholders = params
      .map((_v, index) => `(${generatePlaceholders(keys.length + 1, index > 0 ? (keys.length * index + index) : 0)})`)
      .join(", ");

    const sql = `insert into ${this.tableName} (id, ${columnNames.join(
            ", "
    )}) values ${valuePlaceholders}`;

    logDebug("[sql] insertBatch sql:\t" + sql);
    logDebug("[sql] insertBatch values:\t" + JSON.stringify(allValues));

    const r = await this.db.execute(sql, allValues);
    logDebug("[sql] insertBatch result:\t" + r.rowsAffected);

    return ids;
  }

  async insertSelf(params: Partial<T> & TableLike) {
    const query = new Array<string>();
    const values = new Array<any>();
    for (const key in params) {
      query.push(`\`${key}\``);
      values.push(params[key]);
    }
    const sql = `insert into ${this.tableName} (${query.join(
            ", "
    )}) values (${generatePlaceholders(query.length)})`;
    logDebug("[sql] insert sql:\t\t" + sql);
    logDebug("[sql] insert values:\t" + JSON.stringify(values));
    const r = await this.db.execute(sql, values);
    logDebug("[sql] insert result:\t" + r.rowsAffected);
  }
}
