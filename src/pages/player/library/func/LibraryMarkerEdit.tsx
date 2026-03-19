import type {VideoView} from "@/entity/domain/Video.ts";
import type {MarkerAddForm} from "@/entity/domain/Marker.ts";
import {DialogPlugin, Form, FormItem, Input, Textarea} from "tdesign-vue-next";
import {addMarker} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {join} from "@tauri-apps/api/path";
import {APP_DATA_GENERATE_DIR} from "@/global/Constants.ts";
import {generateMarker} from "@/module/library/command/FfmpegCommand.ts";
import {exists, mkdir} from "@tauri-apps/plugin-fs";

export function openAddVideoMarker(video: VideoView, time: number, onUpdate: () => void) {
  const form = ref<MarkerAddForm>({
    video_id: video.id,
    library_id: video.library_id,
    time: time,
    description: "",
    image: "",
    name: "",
  });
  const dp = DialogPlugin({
    header: "添加标记",
    confirmBtn: "添加",
    default: () => <Form data={form.value}>
      <FormItem label={'标题'} labelAlign={'top'}>
        <Input v-model={form.value.name}/>
      </FormItem>
      <FormItem label={'描述'} labelAlign={'top'}>
        <Textarea v-model={form.value.description}/>
      </FormItem>
    </Form>,
    onConfirm: async () => {
      try {
        // 处理标记目录
        const dataPath = await APP_DATA_GENERATE_DIR();
        const markerDir = await join(dataPath, "marker", video.id);
        if (!(await exists(markerDir))) {
          await mkdir(markerDir, {recursive: true});
        }
        const markerPath = await join(markerDir, `${time}.jpg`);
        // 生成标记
        await generateMarker(video.file_path, markerPath, time);
        // 设置标记图片路径
        form.value.image = markerPath;
        // 添加标记
        await addMarker(form.value)
        dp.destroy();
        onUpdate();
        MessageUtil.success("添加成功")
      } catch (e) {
        MessageUtil.error("添加失败", e);

      }
    }
  })
}