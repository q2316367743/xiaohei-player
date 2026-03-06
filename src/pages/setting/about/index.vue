<template>
  <div class="about-page">
    <div class="about-card">
      <div class="card-header">
        <div class="logo-container">
          <div class="logo-inner">
           <img src="/logo.png" :alt="APP_NAME" class="logo-svg"/>
          </div>
          <div class="logo-shadow"></div>
        </div>
      </div>
      
      <div class="card-body">
        <h1 class="app-name">{{ APP_NAME }}</h1>
        <div class="version-badge">v{{ APP_VERSION }}</div>
        <p class="app-desc">{{ APP_DESC }}</p>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="info-content">
              <div class="info-label">作者</div>
              <div class="info-value">{{ APP_AUTHOR }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </div>
            <div class="info-content">
              <div class="info-label">开源项目</div>
              <div class="info-value link" @click="openGitHub">GitHub</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card-footer">
        <button class="action-button primary" @click="openGitHub">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
          </svg>
          访问 GitHub
        </button>
      </div>
    </div>
    
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {APP_NAME, APP_DESC, APP_AUTHOR, APP_GITHUB, APP_VERSION} from "@/global/Constants.ts";
import {open} from "@tauri-apps/plugin-shell";

const openGitHub = async () => {
  try {
    await open(APP_GITHUB);
  } catch (e) {
    console.error("打开链接失败", e);
  }
};
</script>

<style scoped lang="less">
.about-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: var(--td-bg-color-page);
}

.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: var(--td-brand-color-7);
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: var(--td-brand-color-9);
  bottom: -50px;
  left: -50px;
  animation-delay: -7s;
}

.circle-3 {
  width: 250px;
  height: 250px;
  background: var(--td-brand-color-5);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(-30px, -20px) scale(1.02);
  }
}

.about-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  z-index: 1;
  overflow: hidden;
}

.card-header {
  padding: 24px 20px 12px;
  display: flex;
  justify-content: center;
  position: relative;
}

.logo-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.logo-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-component));
  border-radius: 50%;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.05);
  z-index: 2;
  overflow: hidden;
  .logo-svg {
    width: 100%;
    height: 100%;
  }
}

.logo-shadow {
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 20px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.2) 0%, transparent 70%);
  filter: blur(8px);
  z-index: 1;
}

.logo-svg {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.card-body {
  padding: 12px 24px 20px;
  text-align: center;
}

.app-name {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--td-brand-color-7), var(--td-brand-color-9));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 28px;
  line-height: 28px;
}

.version-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, var(--td-brand-color-7), var(--td-brand-color-8));
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 
    0 4px 12px rgba(0, 82, 217, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.app-desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  line-height: 1.5;
  margin: 0 0 20px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  border-radius: 16px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.03);
}

.info-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--td-brand-color-7), var(--td-brand-color-8));
  border-radius: 12px;
  box-shadow: 
    0 4px 12px rgba(0, 82, 217, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.info-icon svg {
  width: 22px;
  height: 22px;
  color: white;
}

.info-content {
  flex: 1;
  text-align: left;
}

.info-label {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin-bottom: 4px;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.info-value.link {
  color: var(--td-brand-color-7);
  cursor: pointer;
  transition: color 0.2s ease;
}

.info-value.link:hover {
  color: var(--td-brand-color-9);
}

.card-footer {
  padding: 0 32px 32px;
}

.action-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-button svg {
  width: 20px;
  height: 20px;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--td-brand-color-7), var(--td-brand-color-9));
  color: white;
  box-shadow: 
    0 6px 20px rgba(0, 82, 217, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 10px 30px rgba(0, 82, 217, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.action-button.primary:active {
  transform: translateY(0);
  box-shadow: 
    0 4px 12px rgba(0, 82, 217, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

@media (max-width: 480px) {
  .about-page {
    padding: 20px 16px;
  }
  
  .about-card {
    max-width: 100%;
  }
  
  .card-body {
    padding: 16px 24px 24px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .card-footer {
    padding: 0 24px 24px;
  }
}
</style>
