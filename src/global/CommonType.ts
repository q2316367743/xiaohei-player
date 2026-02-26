export interface CommonOption<V = string> {
  label: string;
  value: V;
}

export type YesOrNo = 1 | 0;

/**
 * AI聊天支持的角色
 */
export type AiChatRole = "system" | "user" | "assistant" | "model-change" | "error";