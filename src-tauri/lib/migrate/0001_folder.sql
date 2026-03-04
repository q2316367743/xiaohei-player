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

create table download_plugin
(
    id               text primary key,
    created_at       integer not null default 0,
    updated_at       integer not null default 0,
    name             text    not null default '',
    description      text    not null default '',
    author           text    not null default '',
    version          text    not null default '',
    platform         text    not null default '',
    url              text    not null default '',

    rule_title       text    not null default '',
    rule_cover       text    not null default '',
    rule_author      text    not null default '',
    rule_description text    not null default '',
    rule_url         text    not null default ''
);