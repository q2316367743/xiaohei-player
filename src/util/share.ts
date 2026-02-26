import { snapdom } from "@zumer/snapdom";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { h, render } from "vue";
import { ImageViewer } from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";

export async function captureMoment(element: HTMLElement): Promise<Blob> {
  return await snapdom.toBlob(element, {
    type: "png",
    scale: 2
  });
}

export function previewMomentImage(blob: Blob, filename: string = "朋友圈.png") {
  const url = URL.createObjectURL(blob);
  const container = document.createElement("div");
  document.body.appendChild(container);

  const close = () => {
    URL.revokeObjectURL(url);
    render(null, container);
    container.remove();
  };

  const handleDownload = async () => {
    try {
      const filePath = await save({
        filters: [
          {
            name: "PNG Image",
            extensions: ["png"]
          }
        ],
        defaultPath: filename
      });

      if (filePath) {
        const arrayBuffer = await blob.arrayBuffer();
        await writeFile(filePath, new Uint8Array(arrayBuffer));
        MessageUtil.success("保存成功");
      }
    } catch (error) {
      MessageUtil.error("保存失败: " + (error as Error).message);
    }
  };

  render(
    h(ImageViewer, {
      images: [url],
      defaultIndex: 0,
      defaultVisible: true,
      closeOnOverlay: true,
      onClose: close,
      onDownload: handleDownload,
    }),
    container
  );
}
