import {sha256} from "@/util/lang/CryptoUtil.ts";
import {getVideoById, saveVideo, updateVideo} from "@/service";
import {logDebug, logInfo} from "@/lib/log.ts";
import {stat} from "@tauri-apps/plugin-fs";
import {generatorLibrary} from "@/module/library/component/GenerateLibrary.ts";
import {parseLibrary} from "@/module/library/component/ParseLibrary.ts";
import type {VideoAddForm} from "@/entity/domain/Video.ts";
import type {ScanVideoFile} from "@/module/library/types.ts";
import type {SystemSetting} from "@/entity/setting/SystemSetting.ts";
import type {TaskSetting} from "@/entity/setting/TaskSetting.ts";
import type {GeneratePathResult} from "@/module/library/util.ts";


interface ProcessVideoFileProp {
  file: ScanVideoFile;
  system: SystemSetting,
  task: TaskSetting,
  onProgress: (progress: number, total: number, message: string) => void,
  generatePath: GeneratePathResult;
}

export async function processVideoFile(prop: ProcessVideoFileProp) {
  const {file, system, task, generatePath} = prop;
  const {filePath, fileName} = file;
  const {vttPrefixDir, screenshotDir, coverDir} = generatePath;
  const hash = await sha256(filePath);
  const old = await getVideoById(hash);

  if (old) {
    if (!task.reScanFile) {
      // 不重新扫描，跳过
      logDebug("视频已存在，跳过:", fileName);
      return old;
    }
  }

  logInfo("发现新视频:", fileName);

  // 先去解析元数据，因为元数据可能指向了封面
  const videoMetadata = await parseLibrary(file);

  // 再去考虑生成封面和截图
  const videoInfo = await generatorLibrary({
    hash,
    system,
    task,
    file,
    coverDir,
    screenshotDir,
    vttPrefixDir,
    existingCover: videoMetadata.cover_path || file.cover
  });

  const fileStat = await stat(filePath);

  const form: VideoAddForm = {
    // 基础信息
    library_id: file.item.id,
    file_name: fileName,
    file_path: filePath,
    file_size: fileStat.size,
    file_birthtime: fileStat.birthtime?.getTime() || 0,
    caption: file.caption,
    // 核心信息
    ...videoMetadata,
    // 视频信息
    ...videoInfo,

  };

  if (old) {
    // 更新
    await updateVideo(old.id, form)
  } else {
    await saveVideo(form, hash);
  }

  return form;

}