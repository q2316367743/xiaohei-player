import {debug, error, info, trace, warn} from '@tauri-apps/plugin-log';
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

export function logTrace(message: string, ...args: any[]) {
  if (isTauri()) console.trace(message, ...args)
  trace(renderMessage(message, ...args));
}

export function logWarning(message: string, ...args: any[]) {
  if (isTauri()) console.warn(message, ...args)
  warn(renderMessage(message, ...args));
}

export function logFatal(message: string, ...args: any[]) {
  if (isTauri()) console.error('[FATAL]', message, ...args)
  error(renderMessage('[FATAL] ' + message, ...args));
}

export function logProgress(progress: number, total: number, message: string) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
  const progressMessage = `[${percentage}%] ${message} (${progress}/${total})`;
  if (isTauri()) console.info(progressMessage)
  info(progressMessage);
}