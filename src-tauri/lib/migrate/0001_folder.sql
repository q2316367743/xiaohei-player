create table folder_local
(
    id         text primary key,
    created_at integer not null default 0,
    updated_at integer not null default 0,

    name       text    not null default '',
    path       text    not null default '',
    password   text    not null default ''
);

create table folder_webdav
(

    id            text primary key,
    created_at    integer not null default 0,
    updated_at    integer not null default 0,

    name          text    not null default '',
    path          text    not null default '',
    password      text    not null default '',

    auth_url      text    not null default '',
    auth_username text    not null default '',
    auth_password text    not null default '',
    auth_type     text    not null default 'auto'
);

