export interface SystemPreviewSetting {
  /**
   * 预览片段段数
   * 设置预览片段中的段数。
   * @default 12
   */
  segments: number;
  /**
   * 预览片段长度
   * 每个预览片段的长度，以秒为单位。
   * @default 0.75
   */
  segmentDuration: number;
  /**
   * 排除开始时间
   * 从短片预览中排除最开始 x 秒。
   * @default 0
   */
  excludeStart: number;
  /**
   * 排除结束时间
   * 从短片预览中排除最后 x 秒。
   */
  excludeEnd: number;
}

export interface SystemSetting {
  /**
   * 生成数据的存储路径
   * 生成数据的存储目录（短片标记，短片预览，预览图等）
   */
  dataPath: string;
  /**
   * 缓存路径
   * 缓存的目录位置。如果使用 HLS（例如在 Apple 设备上）或 DASH 进行流传输，则需要该位置。
   */
  cachePath: string;
  /**
   * 刮削器路径
   * 含有刮削器配置文件的路径
   */
  scraperPath: string;
  /**
   * 插件文件路径
   * 插件配置文件目录
   */
  pluginPath: string;
  /**
   * 元数据存储路径
   * 整体导出或者导入时使用的路径
   */
  metaPath: string;
  /**
   * 自定义演员图像路径
   * 默认演员图像的自定义路径。 留空以使用内置默认值
   */
  customActorImagePath: string;
  /**
   * FFmpeg可执行路径
   * ffmpeg可执行文件（不仅仅是文件夹）的路径。如果为空，ffmpeg将通过$PATH、配置目录或$HOME/. stash从环境中解析
   */
  ffmpegPath: string;
  /**
   * FFprobe 可执行路径
   * ffprobe可执行文件的路径（不仅仅是文件夹）。如果为空，ffprobe将通过$PATH、配置目录或$HOME/. stash从环境中解析
   */
  ffprobePath: string;
  /**
   * Python 可执行文件路径
   * Python 执行程序的路径。（不限于文件夹）给网页挖掘器和插件的源文件使用。如果没有，python会从环境变量找到
   */
  pythonPath: string;
  /**
   * 备份用的路径
   * 备份SQLite 数据库文件的目录路径
   */
  backupPath: string;
  /**
   * 回收站路径
   * 删除的文件将被移动到的路径，而不是永久删除。留空将永久删除文件。
   */
  trashPath: string;

  /**
   * 转码生成的串流的最大清晰度
   * 转码生成的串流最大值
   * @example '240p' | '480p' | '720p' | '1080p'  | '4k' | 'original'
   * @default 'original'
   */
  transcoderMaxResolution: '240p' | '480p' | '720p' | '1080p' | '4k' | 'original';
  /**
   * FFmpeg 硬件编码
   * 使用可用的硬件对视频进行编码来用于实时转码。
   * @default false
   */
  transcoderHardwareEncoding: boolean;


  /**
   * 扫描/生成的并行任务数量
   * 设置为 0 以进行自动检测。 警告，当运行超过需要的多个任务使得 cpu 达到满负荷时，将降低性能并可能导致其他问题。
   */
  transcoderParallelTasks: number;

  /**
   * 调整预设值
   * 预设是用来调节预览生成的大小、质量和编码时间。 “slow”以下的选项不推荐使用。
   * @example 'fast' | 'medium' | 'slow' | 'slower' | 'ultrafast' | 'veryfast' | 'veryslow'
   * @default slow
   */
  transcoderPreset: 'fast' | 'medium' | 'slow' | 'slower' | 'ultrafast' | 'veryfast' | 'veryslow';
  /**
   * 包括声音
   * 生成预览时包括音频流.
   * @default true
   */
  transcoderIncludeAudio: boolean;
  /**
   * 预览生成选项
   */
  preview: SystemPreviewSetting;

  /**
   * 日志文件
   * 日志文件的路径，如果为空则表示关闭日志记录。更改之后需要重启。
   */
  logFile: string;
  /**
   * 输出日志到终端
   * 日志除了输出到文件外还输出到终端，如果关闭日志记录则始终开启。更改之后需要重启。
   * @default true
   */
  logToTerminal: boolean;
  /**
   * 日志等级
   * @default info
   */
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  /**
   * 记录 HTTP 访问日志
   * 输出 HTTP 访问日志到终端，更改之后需要重启。
   * @default true
   */
  logHTTP: boolean;
  /**
   * 最大日志尺寸
   * 日志文件压缩前的最大大小（以兆字节为单位）。0MB 表示禁用此功能。需要重启。
   * @default 0
   */
  maxLogSize: number;
}

export function getSystemSetting(): SystemSetting {
  return {
    // 这些目录都是相对于$APPDATA 的
    dataPath: '/generated/',
    cachePath: '/cache/',
    scraperPath: '/root/.stash/scrapers',
    pluginPath: '/root/.stash/plugins',
    metaPath: '/metadata/',
    customActorImagePath: '',
    ffmpegPath: '',
    ffprobePath: '',
    pythonPath: '',
    backupPath: '',
    trashPath: '',
    transcoderMaxResolution: 'original',
    transcoderHardwareEncoding: false,
    transcoderParallelTasks: 0,
    transcoderPreset: 'slow',
    transcoderIncludeAudio: true,
    preview: {
      segments: 12,
      segmentDuration: 0.75,
      excludeStart: 0,
      excludeEnd: 0
    },
    logFile: '',
    logToTerminal: true,
    logLevel: 'info',
    logHTTP: true,
    maxLogSize: 0
  }
}

export const SystemSettingTitle: Record<keyof SystemSetting, string> = {
  dataPath: '生成数据的存储路径',
  cachePath: '缓存路径',
  scraperPath: '刮削器路径',
  pluginPath: '插件文件路径',
  metaPath: '元数据存储路径',
  customActorImagePath: '自定义演员图像路径',
  ffmpegPath: 'FFmpeg可执行路径',
  ffprobePath: 'FFprobe 可执行路径',
  pythonPath: 'Python 可执行文件路径',
  backupPath: '备份用的路径',
  trashPath: '回收站路径',
  transcoderMaxResolution: '转码生成的串流的最大清晰度',
  transcoderHardwareEncoding: 'FFmpeg 硬件编码',
  transcoderParallelTasks: '扫描/生成的并行任务数量',
  transcoderPreset: '调整预设值',
  transcoderIncludeAudio: '包括声音',
  preview: '预览生成选项',
  logFile: '日志文件',
  logToTerminal: '输出日志到终端',
  logLevel: '日志等级',
  logHTTP: '记录 HTTP 访问日志',
  maxLogSize: '最大日志尺寸'
};