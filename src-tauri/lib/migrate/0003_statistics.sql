CREATE TABLE IF NOT EXISTS play_history
(
    id               TEXT PRIMARY KEY,
    created_at       INTEGER NOT NULL DEFAULT 0,
    updated_at       INTEGER NOT NULL DEFAULT 0,

    video_id         TEXT    NOT NULL DEFAULT '',        -- 视频ID
    library_id       TEXT    NOT NULL DEFAULT '',        -- 收藏库ID
    played_at        INTEGER NOT NULL DEFAULT 0,         -- 播放时间戳
    duration_played  INTEGER NOT NULL DEFAULT 0,         -- 本次播放时长
    progress_percent INTEGER NOT NULL DEFAULT 0,         -- 播放进度百分比
    completed        INTEGER NOT NULL DEFAULT 0          -- 是否播放完成 (0:未完成, 1:已完成)
);

CREATE INDEX IF NOT EXISTS idx_play_history_video ON play_history (video_id);
CREATE INDEX IF NOT EXISTS idx_play_history_library ON play_history (library_id);
CREATE INDEX IF NOT EXISTS idx_play_history_played_at ON play_history (played_at DESC);

CREATE TABLE IF NOT EXISTS daily_statistics
(
    id               TEXT PRIMARY KEY,
    created_at       INTEGER NOT NULL DEFAULT 0,
    updated_at       INTEGER NOT NULL DEFAULT 0,

    date             TEXT    NOT NULL DEFAULT '',        -- 日期
    play_count       INTEGER NOT NULL DEFAULT 0,         -- 播放次数
    play_duration    INTEGER NOT NULL DEFAULT 0,         -- 播放总时长
    videos_added     INTEGER NOT NULL DEFAULT 0,         -- 新增视频数
    videos_completed INTEGER NOT NULL DEFAULT 0          -- 完成观看数
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_statistics_date ON daily_statistics (date);
