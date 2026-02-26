import {debug, error, info} from '@tauri-apps/plugin-log';
import {isTauri} from "@tauri-apps/api/core";


function renderMessage(message: string, ...args: any[]) {
  return message + (args && args.length > 0 ? (": " + args.join(",")) : '');
}

export function logDebug(message: string, ...args: any[]) {
  if (isTauri()) console.debug(message, ...args)
  debug(renderMessage(message, ...args));
}

export function logInfo(message: string, ...args: any[]) {
  if (isTauri()) console.info(message, ...args)
  info(renderMessage(message, ...args));
}

export function logError(message: string, ...args: any[]) {
  if (isTauri()) console.error(message, ...args)
  error(renderMessage(message, ...args));
}