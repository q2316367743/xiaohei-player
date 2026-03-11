create table folder
(
    id         text primary key,
    created_at integer not null default 0,
    updated_at integer not null default 0,

    name       text    not null default '',
    path       text    not null default '',
    password   text    not null default '',

    type       text    not null default '',
    payload    text    not null default ''
);

create table library
(
    id         text primary key,
    created_at integer not null default 0,
    updated_at integer not null default 0,

    cover      text    not null default '',
    name       text    not null default '',
    path       text    not null default '',
    password   text    not null default ''
);

create table history
(
    id               text primary key,
    created_at       integer not null default 0,
    updated_at       integer not null default 0,
    title            text    not null default '',
    path             text    not null default '',
    type             text    not null default '',
    last_played_time integer not null default 0,
    progress_second  integer not null default 0
);


CREATE UNIQUE INDEX IF NOT EXISTS idx_history_path ON history (path);
CREATE INDEX IF NOT EXISTS idx_history_lpt ON history (last_played_time);