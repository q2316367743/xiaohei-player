import {MessagePlugin} from "tdesign-vue-next";
import {stringifyJsonWithBigIntSupport} from "@/util";

function render(message: string, e?: any) {
  if (e instanceof Error) {
    return e ? `${message}，${e.message}` : message;
  } else {
    return e ? `${message}，${e}` : message;
  }
}

function success(message: any): void;
function success(message: any, callback: () => void): void;
function success(message: any, callback?: () => void): void {
  MessagePlugin.success({
    closeBtn: true,
    content: typeof message === "string" ? message : stringifyJsonWithBigIntSupport(message)
  });
  if (callback) {
    callback()
  }
}

function warning(message: string, e?: any): void {
  MessagePlugin.warning({
    closeBtn: true,
    content: render(message, e)
  });
  console.error(message, e);
}

function error(message: string): void;
function error(message: string, e: any): void;
function error(message: string, e: any, callback: () => void): void;
function error(message: string, e?: any, callback?: () => void): void {
  MessagePlugin.error({
    closeBtn: true,
    content: render(message, e)
  });
  console.error(message, e);
  if (callback) {
    callback()
  }
}

export default {
  success,
  info(message: any) {
    MessagePlugin.info({
      closeBtn: true,
      content: typeof message === "string" ? message : stringifyJsonWithBigIntSupport(message)
    });
  },
  warning,
  error
};
