import {deleteVideoPhysical, removeVideoTag, removeVideoActor, removeMarker, getVideoById} from "@/service";
import {APP_DATA_GENERATE_DIR} from "@/global/Constants.ts";
import {joinPath, parseFilename} from "@/util/lang/FileUtil.ts";
import {remove} from "@tauri-apps/plugin-fs";

/**
 * 删除视频
 * @param id 视频ID
 */
export async function deleteVideoService(id: string, file = false) {
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
  const markerDir = joinPath(generateDir, "marker");
  const [filename] = parseFilename(old.file_name);
  if (file) {
    await remove(old.file_path);
  }
  try {
    await remove(joinPath(coverDir, filename + '.jpg'));
  } catch (e) {
    console.error(e)
  }
  try {
    await remove(joinPath(markerDir, filename));
  } catch (e) {
    console.error(e)
  }
  try {
    await remove(old.screenshot_path);
  } catch (e) {
    console.error(e)
  }
  try {
    await remove(old.vtt_path);
  } catch (e) {
    console.error(e)
  }
  try {
    await remove(old.sprite_path);
  } catch (e) {
    console.error(e)
  }
}