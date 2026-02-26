/// <reference types="vite/client" />

declare module 'jinrishici' {
  export interface JinrishiciResult {
    status: string;
    data: {
      content: string[];
      origin: {
        title: string;
        dynasty: string;
        author: string;
        content: string[];
        translate: string[];
      };
      matchTags: string[];
    };
  }

  export function load(callback: (result: JinrishiciResult) => void): void;
}