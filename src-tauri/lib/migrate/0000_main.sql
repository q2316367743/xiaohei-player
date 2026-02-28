CREATE TABLE IF NOT EXISTS video
(
    id               TEXT PRIMARY KEY,                   -- 视频文件内容的 SHA-256 Hash (例如: "a1b2c3...")
    created_at       INTEGER NOT NULL DEFAULT 0,
    updated_at       INTEGER NOT NULL DEFAULT 0,

    file_path        TEXT    NOT NULL DEFAULT '' UNIQUE, -- 当前绝对文件路径 (UNIQUE 约束防止同一路径重复插入，但允许 Hash 相同路径不同？需业务逻辑控制)
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

    -- 状态标记
    is_deleted       INTEGER NOT NULL DEFAULT 0,         -- 软删除标记 (0:正常, 1:已删除)
    scan_status      TEXT    NOT NULL DEFAULT 'pending', -- 扫描状态: 'pending', 'scanning', 'completed', 'error'
    error_message    TEXT    NOT NULL DEFAULT ''         -- 扫描或处理错误信息

    -- 索引优化
);

-- 创建常用查询索引
CREATE INDEX IF NOT EXISTS idx_videos_title ON video (title);
CREATE INDEX IF NOT EXISTS idx_videos_last_played ON video (last_played_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_file_path ON video (file_path);

-- 演员
CREATE TABLE IF NOT EXISTS actor
(
    id            TEXT PRIMARY KEY,
    created_at    INTEGER NOT NULL DEFAULT 0,
    updated_at    INTEGER NOT NULL DEFAULT 0,
    name          TEXT    NOT NULL DEFAULT '' UNIQUE, -- 演员姓名 (如: "张彪")
    original_name TEXT    NOT NULL DEFAULT '',        -- 原名/英文名
    gender        TEXT    NOT NULL DEFAULT '',        -- 性别: 'male', 'female', 'other'
    birth_date    TEXT    NOT NULL DEFAULT '',        -- 出生日期
    death_date    TEXT    NOT NULL DEFAULT '',        -- 逝世日期 (可选)
    biography     TEXT    NOT NULL DEFAULT '',        -- 简介
    photo_path    TEXT    NOT NULL DEFAULT ''         -- 头像本地路径
);

CREATE INDEX IF NOT EXISTS idx_actors_name ON actor (name);

-- 工作室
CREATE TABLE IF NOT EXISTS studio
(
    id           TEXT PRIMARY KEY,
    created_at   INTEGER NOT NULL DEFAULT 0,
    updated_at   INTEGER NOT NULL DEFAULT 0,
    name         TEXT    NOT NULL DEFAULT '' UNIQUE, -- 工作室名称
    country      TEXT    NOT NULL DEFAULT '',        -- 所属国家
    founded_year INTEGER NOT NULL DEFAULT 0,         -- 成立年份
    website      TEXT    NOT NULL DEFAULT '',        -- 官网
    logo_path    TEXT    NOT NULL DEFAULT ''         -- Logo 本地路径
);

CREATE INDEX IF NOT EXISTS idx_studios_name ON studio (name);

CREATE TABLE IF NOT EXISTS video_actor
(
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL DEFAULT 0,
    video_id    TEXT    NOT NULL DEFAULT '', -- 对应 videos.id (Hash)
    actor_id    INTEGER NOT NULL DEFAULT 0,  -- 对应 actors.id
    role_name   TEXT    NOT NULL DEFAULT '', -- 在该视频中饰演的角色名
    order_index INTEGER NOT NULL DEFAULT 0,  -- 演员排序 (主演在前)

    FOREIGN KEY (video_id) REFERENCES video (id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actor (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_video_actors_actor ON video_actor (actor_id);
CREATE INDEX IF NOT EXISTS idx_video_actors_video ON video_actor (video_id);


-- 标签
CREATE TABLE IF NOT EXISTS tag
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    name       TEXT    NOT NULL DEFAULT '' UNIQUE,
    color      TEXT    NOT NULL DEFAULT ''-- 标签显示颜色 (hex)
);

CREATE TABLE IF NOT EXISTS video_tag
(
    id         TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    video_id   TEXT    NOT NULL DEFAULT '',
    tag_id     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (video_id) REFERENCES video (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_video_tags_tag ON video_tag (tag_id);