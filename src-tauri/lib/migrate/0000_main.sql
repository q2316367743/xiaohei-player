CREATE TABLE IF NOT EXISTS video
(
    id               TEXT PRIMARY KEY,                   -- 视频文件内容的 SHA-256 Hash (例如: "a1b2c3...")
    created_at       INTEGER NOT NULL DEFAULT 0,
    updated_at       INTEGER NOT NULL DEFAULT 0,

    library_id       TEXT    NOT NULL DEFAULT '',        -- 所属媒体库

    file_path        TEXT    NOT NULL DEFAULT '',        -- 当前绝对文件路径 (UNIQUE 约束防止同一路径重复插入，但允许 Hash 相同路径不同？需业务逻辑控制)
    screenshot_path  TEXT    NOT NULL DEFAULT '',
    sprite_path      TEXT    NOT NULL DEFAULT '',
    vtt_path         TEXT    NOT NULL DEFAULT '',
    cover_path       TEXT    NOT NULL DEFAULT '',        -- 封面图片
    file_name        TEXT    NOT NULL DEFAULT '',        -- 文件名 (带扩展名)
    file_size        INTEGER NOT NULL DEFAULT 0,         -- 文件大小 (字节)
    file_birthtime   INTEGER NOT NULL DEFAULT 0,         -- 文件创建时间
    hidden           INTEGER NOT NULL DEFAULT 0,         -- 隐藏标记 (0:正常, 1:已隐藏)

    -- 视频信息
    duration_ms      INTEGER NOT NULL DEFAULT 0,         -- 视频时长 (毫秒)
    width            INTEGER NOT NULL DEFAULT 0,         -- 分辨率宽
    height           INTEGER NOT NULL DEFAULT 0,         -- 分辨率高
    fps              INTEGER NOT NULL DEFAULT 0,
    bit_rate         INTEGER NOT NULL DEFAULT 0,
    container_format TEXT    NOT NULL DEFAULT '',        -- 容器格式 (mp4, mkv, avi...)
    video_codec      TEXT    NOT NULL DEFAULT '',        -- 视频编码 (h264, hevc...)
    audio_codec      TEXT    NOT NULL DEFAULT '',        -- 音频编码 (aac, mp3...)

    -- 用户可编辑的元数据
    title            TEXT    NOT NULL DEFAULT '',        -- 视频标题 (可手动覆盖)
    description      TEXT    NOT NULL DEFAULT '',        -- 描述
    link             TEXT    NOT NULL DEFAULT '',
    release_date     TEXT    NOT NULL DEFAULT '',        -- 发行日期
    director         TEXT    NOT NULL DEFAULT '',
    studio_id        TEXT    NOT NULL DEFAULT '',

    -- 播放信息
    last_played_at   INTEGER NOT NULL DEFAULT 0,         -- 最后播放时间
    play_count       INTEGER          DEFAULT 0,         -- 播放次数
    resume_time      INTEGER NOT NULL DEFAULT 0,         -- 续播位置

    -- 状态标记
    is_deleted       TEXT    NOT NULL DEFAULT '0',       -- 软删除标记 (0:正常, 1:已删除)
    is_liked         INTEGER NOT NULL DEFAULT 0          -- 是否点赞 (0:正常, 1:已点赞)

    -- 索引优化
);

-- 创建常用查询索引
CREATE INDEX IF NOT EXISTS idx_video_library ON video (library_id);
CREATE INDEX IF NOT EXISTS idx_video_title ON video (title);
CREATE INDEX IF NOT EXISTS idx_video_last_played ON video (last_played_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_file_path ON video (file_path, is_deleted);

-- 演员
CREATE TABLE IF NOT EXISTS actor
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL DEFAULT 0,
    updated_at    INTEGER NOT NULL DEFAULT 0,

    library_id    TEXT    NOT NULL DEFAULT '',        -- 所属媒体库

    name          TEXT    NOT NULL DEFAULT '' UNIQUE, -- 演员姓名 (如: "张彪")
    original_name TEXT    NOT NULL DEFAULT '',        -- 原名/英文名
    gender        TEXT    NOT NULL DEFAULT '',        -- 性别: 'male', 'female', 'other'
    birth_date    TEXT    NOT NULL DEFAULT '',        -- 出生日期
    death_date    TEXT    NOT NULL DEFAULT '',        -- 逝世日期 (可选)
    biography     TEXT    NOT NULL DEFAULT '',        -- 简介
    photo_path    TEXT    NOT NULL DEFAULT ''         -- 头像本地路径
);

CREATE INDEX IF NOT EXISTS idx_actor_name ON actor (name);
CREATE INDEX IF NOT EXISTS idx_actor_library ON actor (library_id);

-- 工作室
CREATE TABLE IF NOT EXISTS studio
(
    id           TEXT PRIMARY KEY,
    created_at   INTEGER NOT NULL DEFAULT 0,
    updated_at   INTEGER NOT NULL DEFAULT 0,

    library_id   TEXT    NOT NULL DEFAULT '',        -- 所属媒体库

    name         TEXT    NOT NULL DEFAULT '' UNIQUE, -- 工作室名称
    country      TEXT    NOT NULL DEFAULT '',        -- 所属国家
    founded_year INTEGER NOT NULL DEFAULT 0,         -- 成立年份
    website      TEXT    NOT NULL DEFAULT '',        -- 官网
    logo_path    TEXT    NOT NULL DEFAULT ''         -- Logo 本地路径
);

CREATE INDEX IF NOT EXISTS idx_studio_name ON studio (name);
CREATE INDEX IF NOT EXISTS idx_studio_library ON studio (library_id);

CREATE TABLE IF NOT EXISTS video_actor
(
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL DEFAULT 0,
    video_id    TEXT    NOT NULL DEFAULT '', -- 对应 videos.id (Hash)
    actor_id    TEXT    NOT NULL DEFAULT '', -- 对应 actors.id
    role_name   TEXT    NOT NULL DEFAULT '', -- 在该视频中饰演的角色名
    order_index INTEGER NOT NULL DEFAULT 0   -- 演员排序 (主演在前)
);

CREATE INDEX IF NOT EXISTS idx_video_actors_actor ON video_actor (actor_id);
CREATE INDEX IF NOT EXISTS idx_video_actors_video ON video_actor (video_id);


-- 标签
CREATE TABLE IF NOT EXISTS tag
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,

    library_id TEXT    NOT NULL DEFAULT '', -- 所属媒体库

    name       TEXT    NOT NULL DEFAULT '' UNIQUE,
    color      TEXT    NOT NULL DEFAULT ''-- 标签显示颜色 (hex)
);

CREATE INDEX IF NOT EXISTS idx_tag_library ON tag (library_id);

CREATE TABLE IF NOT EXISTS video_tag
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    video_id   TEXT    NOT NULL DEFAULT '',
    tag_id     TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_video_tags_tag ON video_tag (tag_id);

CREATE TABLE IF NOT EXISTS marker
(
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL DEFAULT 0,
    library_id  TEXT    NOT NULL DEFAULT '',
    video_id    TEXT    NOT NULL DEFAULT '',

    name        TEXT    NOT NULL DEFAULT '',
    time        INTEGER NOT NULL DEFAULT 0,
    description TEXT    NOT NULL DEFAULT '',
    image       TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_marker_video ON marker (video_id);
CREATE INDEX IF NOT EXISTS idx_marker_library ON marker (library_id);

