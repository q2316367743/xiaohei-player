CREATE TABLE IF NOT EXISTS network_server
(
    id                  TEXT PRIMARY KEY,
    created_at          INTEGER NOT NULL DEFAULT 0,
    updated_at          INTEGER NOT NULL DEFAULT 0,

    `group`             TEXT    NOT NULL DEFAULT '',
    sequence            INTEGER NOT NULL DEFAULT 0,
    name                TEXT    NOT NULL DEFAULT '',
    type                TEXT    NOT NULL DEFAULT '',
    format              TEXT    NOT NULL DEFAULT '',
    url                 TEXT    NOT NULL DEFAULT '',
    m3u8_parse          TEXT    NOT NULL DEFAULT '',
    is_aggregate_search INTEGER NOT NULL DEFAULT 0,
    home                TEXT    NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS media_server
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    name       TEXT    NOT NULL DEFAULT '',
    type       TEXT    NOT NULL DEFAULT '',
    is_enabled INTEGER NOT NULL DEFAULT 0,
    url        TEXT    NOT NULL DEFAULT '',
    sequence   INTEGER NOT NULL DEFAULT 0,
    username   TEXT    NOT NULL DEFAULT '',
    password   TEXT    NOT NULL DEFAULT ''
);

