import {deleteVideoPhysical, removeVideoTag, removeVideoActor, removeMarker, getVideoById} from "@/service";
import {APP_DATA_GENERATE_DIR} from "@/global/Constants.ts";
import {joinPath, parseFilename} from "@/util/lang/FileUtil.ts";
import {remove} from "@tauri-apps/plugin-fs";

/**
 * 删除视频
 * @param id 视频ID
 */
export async function deleteVideoService(id: string) {
  const old = await getVideoById(id);
  if (!old) {
    return Promise.reject(Error("视频不存在"));
  }
  // 删除 video
  await deleteVideoPhysical(id)
  // 删除 video_actor / video_tag / marker
  await removeVideoActor(id);
  await removeVideoTag(id);
  await removeMarker(id);
  // 删除 marker / cover / vtt / preview
  const generateDir = APP_DATA_GENERATE_DIR();
  const coverDir = joinPath(generateDir, "cover");
  const screenshotDir = joinPath(generateDir, "screenshot");
  const vttDir = joinPath(generateDir, "vtt");
  const markerDir = joinPath(generateDir, "marker");
  const [filename] = parseFilename(old.file_name);
  // 没有该文件，删除
  try {
    await remove(joinPath(coverDir, filename + '.jpg'));
  } catch (e) {
    console.error(e)
  }
  try {
    await remove(joinPath(markerDir, filename + '.jpg'));
  } catch (e) {
    console.error(e)
  }
  try {
    await remove(joinPath(screenshotDir, filename + '.mp4'));
  } catch (e) {
    console.error(e)
  }
  try {
    await remove(joinPath(vttDir, filename + '_sprite.jpg'));
  } catch (e) {
    console.error(e)
  }
  try {
    await remove(joinPath(vttDir, filename + '_thumbs.vtt'));
  } catch (e) {
    console.error(e)
  }
}