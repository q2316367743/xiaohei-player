import {defineConfig, presetUno} from 'unocss'

export default defineConfig({
  presets: [
    presetUno({
      dark: 'class',
    }),
  ],
  theme: {
    colors: {
      'td-brand': 'var(--td-brand-color)',
      'td-brand-hover': 'var(--td-brand-color-hover)',
      'td-text-primary': 'var(--td-text-color-primary)',
      'td-text-secondary': 'var(--td-text-color-secondary)',
      'td-text-placeholder': 'var(--td-text-color-placeholder)',
      'td-bg-container': 'var(--td-bg-color-container)',
      'td-bg-secondarycontainer': 'var(--td-bg-color-secondarycontainer)',
      'td-bg-component': 'var(--td-bg-color-component)',
      'td-bg-component-hover': 'var(--td-bg-color-component-hover)',
      'td-border-1': 'var(--td-border-level-1-color)',
      'td-border-2': 'var(--td-border-level-2-color)',
    },
  },
  shortcuts: {
    'bg-td-container': 'bg-td-bg-container',
    'bg-td-secondary': 'bg-td-bg-secondarycontainer',
    'text-td-primary': 'text-td-text-primary',
    'text-td-secondary': 'text-td-text-secondary',
    'text-td-placeholder': 'text-td-text-placeholder',
    'border-td-1': 'border-td-border-1',
    'border-td-2': 'border-td-border-2',
  },
  rules: [
    [/^abs-(\d+)$/, ([, size]) => ({
      'position': 'absolute',
      'top': `${size}px`,
      'left': `${size}px`,
      'right': `${size}px`,
      'bottom': `${size}px`
    })],
  ]
})
