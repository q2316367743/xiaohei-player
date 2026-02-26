import * as js from "@eslint/js";
import * as globals from "globals";
import * as tseslint from "typescript-eslint";
import * as pluginVue from "eslint-plugin-vue";
import css from "@eslint/css";
import {defineConfig} from "eslint/config";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import autoImportGlobals from "./.eslintrc-auto-import.json";

export default defineConfig([
  {ignores: ["dist/**", "**/dist-js/**", "src-tauri/**", "node_modules/**"]},
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: {js}, extends: ["js/recommended"], languageOptions: {
      globals: {
        ...globals.browser,
        ...autoImportGlobals.globals, // 👈 合并自动导入的全局变量
      }
    }
  },
  tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"].map(config => ({
    ...config,
    files: ["**/*.vue"]
  })),
  {files: ["**/*.vue"], languageOptions: {parserOptions: {parser: tseslint.parser}}},
  {files: ["**/*.css"], plugins: {css}, language: "css/css", extends: ["css/recommended"]},
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  // 👇 特别为 src-utools 目录放宽限制
  {
    files: ['src-utools/**/*.js'], // 注意：TypeScript 文件一般不用 require，所以只配 .js
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        utools: true,
        Buffer: true,
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off', // 关闭 require 禁止
      'no-undef': 'off' // 可选：避免 require/module 报未定义（如果没设 env）
    }
  }
]);
