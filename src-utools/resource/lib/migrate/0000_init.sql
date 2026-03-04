-- 订阅源（对应 SubscribeItem）
CREATE TABLE IF NOT EXISTS subscribe_item
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL,           -- Unix 毫秒时间戳（与 JS Date.now() 一致）
    updated_at    INTEGER NOT NULL,

    url           TEXT    NOT NULL,
    icon          TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    folder        TEXT    NOT NULL,
    count         INTEGER NOT NULL DEFAULT 0, -- 资讯数量
    un_read_count INTEGER NOT NULL DEFAULT 0, -- 未读数量
    sequence      INTEGER NOT NULL DEFAULT 0  -- 排序
);

-- 新闻项（对应 FeedItem）
CREATE TABLE IF NOT EXISTS feed_item
(
    id              TEXT PRIMARY KEY,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL,

    subscribe_id    TEXT    NOT NULL,

    `signal`        TEXT    NOT NULL UNIQUE,    -- 全局唯一标识（如 GUID 或 link）
    title           TEXT    NOT NULL,
    link            TEXT    NOT NULL,
    pub_date        INTEGER NOT NULL,
    author          TEXT,
    summary         TEXT,
    is_read         INTEGER NOT NULL DEFAULT 0, -- SQLite 用 0/1 表示布尔
    content_fetched INTEGER NOT NULL DEFAULT 0
);

-- 为 feed_items 添加索引：加速按 signal 查询（关联内容时使用）
CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_items_signal ON feed_item (signal);

-- 文章内容（对应 FeedContent）
CREATE TABLE IF NOT EXISTS feed_content
(
    id             TEXT PRIMARY KEY, -- 可与 feed_items.id 一致，或用 signal

    subscribe_id   TEXT    NOT NULL,
    feed_id        TEXT    NOT NULL,

    item_link      TEXT    NOT NULL, -- 对应 feed_items.signal 或 link
    html_content   TEXT,
    parsed_title   TEXT,
    parsed_content TEXT,
    fetch_time     TEXT    NOT NULL, -- ISO8601
    parse_success  BOOLEAN NOT NULL DEFAULT 0
);

-- 为 feed_contents 添加索引：通过 itemLink 快速查找内容
CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_contents_itemlink ON feed_content (item_link);

CREATE TABLE analysis_session
(
    id               TEXT PRIMARY KEY,
    created_at       INTEGER NOT NULL,
    updated_at       INTEGER NOT NULL,

    filename         TEXT    NOT NULL, -- 原始文件名（如 "alipay_2025.csv"）
    source_type      TEXT,             -- 'bank', 'alipay', 'wechat' 等（可选）
    record_count     INTEGER,          -- 解析出的有效交易数
    date_range_start INTEGER,             -- 账单最早日期
    date_range_end   INTEGER              -- 账单最晚日期
);

CREATE TABLE `analysis_transaction`
(
    id           TEXT PRIMARY KEY,
    created_at   INTEGER                                    NOT NULL,
    updated_at   INTEGER                                    NOT NULL,

    session_id   TEXT                                       NOT NULL,
    -- 交易时间
    date         INTEGER                                    NOT NULL,
    -- 交易商品
    product      TEXT,
    -- 交易对方
    counterparty TEXT,
    -- 分类
    category     TEXT,
    --  交易类型，支出还是收入
    type         TEXT,
    -- 金额
    amount       INTEGER                                    NOT NULL,
    remark       TEXT,
    FOREIGN KEY (session_id) REFERENCES analysis_session (id) ON DELETE CASCADE
);

-- 1. 按会话快速定位（几乎所有查询都带 session_id）
CREATE INDEX idx_transactions_session_id ON analysis_transaction (session_id);

-- 2. 按会话+日期高效聚合（用于趋势图、日历视图）
CREATE INDEX idx_transactions_session_date ON analysis_transaction (session_id, date);

-- 3. 按会话+类型+类别高效分组（用于饼图、分类排行）
CREATE INDEX idx_transactions_session_type_category
    ON analysis_transaction (session_id, type, category);

CREATE TABLE analysis_category
(
    id           TEXT PRIMARY KEY,
    created_at   INTEGER                                    NOT NULL,

    session_id   TEXT                                       NOT NULL,

    name          TEXT    NOT NULL, -- 如 "餐饮", "交通"
    display_order INTEGER NOT NULL        -- 控制前端显示顺序
);

create unique index analysis_category_session_id_name_uindex
    on analysis_category (session_id, name);