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

  // ---------------------------------- 网络相关 ----------------------------------

  proxy_enabled: boolean;
  // 代理协议
  proxy_protocol: 'http' | 'https' | 'socks5';
  proxy_host: string;
  proxy_port: number;
  proxy_username: string;
  proxy_password: string;

  // ---------------------------------- 转码 ----------------------------------

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

  // ---------------------------------- 预览视频 ----------------------------------

  /**
   * 预览生成选项
   */
  preview: SystemPreviewSetting;

  // ---------------------------------- 日志相关 ----------------------------------

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
    proxy_enabled: false,
    proxy_protocol: 'http',
    proxy_host: '127.0.0.1',
    proxy_port: 7890,
    proxy_username: '',
    proxy_password: '',
    // 这些目录都是相对于$APPDATA 的
    transcoderMaxResolution: 'original',
    transcoderHardwareEncoding: false,
    transcoderParallelTasks: 0,
    transcoderPreset: 'slow',
    transcoderIncludeAudio: false,
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
  proxy_enabled: '代理启用',
  proxy_protocol: '代理协议',
  proxy_host: '代理主机',
  proxy_port: '代理端口',
  proxy_username: '代理用户名',
  proxy_password: '代理密码',
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