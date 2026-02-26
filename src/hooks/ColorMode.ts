import {setTheme} from '@tauri-apps/api/app';
import {LocalName} from "@/global/LocalName";

export type ColorModeType = "auto" | "light" | "dark";

interface ColorModeResult {
  colorMode: Ref<ColorModeType>;
  isDark: ComputedRef<boolean>;
}

function isDarkColors(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}


export const useColorMode = (): ColorModeResult => {
  const colorMode = useLocalStorage<ColorModeType>(LocalName.KEY_THEME, "auto");
  const isDark = ref(isDarkColors());

  function renderColorMode() {

    // 获取系统主题
    isDark.value = isDarkColors();

    // 渲染主题css
    const htmlElement = document.documentElement;

    if (isDark.value) {
      htmlElement.setAttribute("theme-mode", "dark");
      htmlElement.classList.remove("light");
      htmlElement.classList.add("dark");
    } else {
      htmlElement.setAttribute("theme-mode", "light");
      htmlElement.classList.remove("dark");
      htmlElement.classList.add("light");
    }
  }

  watch(colorMode, async () => {
    // 设置系统主题
    await setTheme(colorMode.value === 'auto' ? null : colorMode.value);
    // 渲染主题css
    renderColorMode();
  }, {immediate: true});
  const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
  mql?.addEventListener?.("change", renderColorMode);

  return {
    colorMode,
    isDark: computed(() => isDark.value)
  };
};
