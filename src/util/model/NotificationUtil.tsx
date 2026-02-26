import { Button, NotifyPlugin, type TNode } from "tdesign-vue-next";

export default {
  success(content: string | TNode, title?: string): void {
    NotifyPlugin.success({
      default: content,
      title,
      closeBtn: true,
      duration: 3000
    });
  },
  info(content: string | TNode, title?: string): void {
    NotifyPlugin.info({
      default: content,
      title,
      closeBtn: true,
      duration: 3000
    });
  },
  warning(content: string | TNode, title?: string): void {
    NotifyPlugin.warning({
      default: content,
      title,
      closeBtn: true,
      duration: 3000
    });
  },
  error(content: string | TNode, title?: string): void {
    NotifyPlugin.error({
      default: content,
      title,
      closeBtn: true,
      duration: 3000
    });
  },

  confirm(
    content: string,
    title: string,
    config: {
      confirmButtonText: string;
      cancelButtonText: string;
      duration?: number;
    }
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      let flag = true;
      const notificationReturn = await NotifyPlugin.info({
        default: content,
        title,
        closeBtn: true,
        duration: config.duration,
        footer: () => (
          <div>
            <Button
              theme={"primary"}
              variant={"text"}
              onClick={() => {
                reject();
                flag = false;
                notificationReturn.close();
              }}
            >
              {config.cancelButtonText}
            </Button>
            <Button
              theme={"primary"}
              onClick={() => {
                resolve();
                flag = false;
                notificationReturn.close();
              }}
            ></Button>
          </div>
        ),
        onCloseBtnClick() {
          if (flag) {
            reject();
          }
        }
      });
    });
  },

  alert(
    content: string,
    title: string,
    config: {
      confirmButtonText: string;
      duration?: number;
    }
  ): Promise<void> {
    const { confirmButtonText, duration } = config;
    return new Promise<void>(async (resolve) => {
      function onConfirm() {
        resolve();
        notificationReturn.close();
      }

      const notificationReturn = await NotifyPlugin.info({
        default: content,
        title,
        closeBtn: true,
        duration: duration,
        footer: () => (
          <div style={{ textAlign: "right" }}>
            <Button theme={"primary"} onClick={onConfirm}>
              {confirmButtonText}
            </Button>
          </div>
        )
      });
    });
  }
};
