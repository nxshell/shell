<template>
    <div class="pt-window" :class="{ 'not-macos': !IS_MAC_OS }">
        <div class="left-panel" v-if="leftPanel" :style="{ width: leftPanelWidth + 'px' }">
            <nx-navbar />
        </div>
        <div class="main-panel" :style="{width: leftPanel? `calc(100% - 50px)` : '100%'}">
            <div class="title-bar" :class="{ drag: isMainWindow, deactive: !active }">
                <!-- 顶部工具栏 -->
                <nx-toolbar />
                <!-- 右侧开关 -->
                <div class="window-controls-container" v-if="!IS_MAC_OS">
                    <div v-if="showLayout" class="n-layout-wrapper">
                        <el-tooltip class="item" effect="dark" :content="t('home.session-instance.context-menu.split-normal')" placement="top-start">
							<span class="n-layout-button" :class="{'is-active':layoutMode === 'normal'}" data-layout="normal" @click="changeLayout">
								<n-icon name="layout-alone" size="16" />
							</span>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" :content="t('home.session-instance.context-menu.split-row')" placement="top-start">
							<span class="n-layout-button" :class="{'is-active':layoutMode === 'row'}" data-layout="row" @click="changeLayout">
								<n-icon name="layout-row" size="16" />
							</span>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" :content="t('home.session-instance.context-menu.split-column')" placement="top-start">
							<span class="n-layout-button" :class="{'is-active':layoutMode === 'col'}" data-layout="col" @click="changeLayout">
								<n-icon name="layout-col" size="16" />
							</span>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" :content="t('home.session-instance.context-menu.split-grid')" placement="top-start">
							<span class="n-layout-button" :class="{'is-active':layoutMode === 'grid'}" data-layout="grid" @click="changeLayout">
								<n-icon name="layout-lattice" size="16" />
							</span>
                        </el-tooltip>
                    </div>
                    <n-space :size="14">
						<span class="control-btn" @click="doMinimize">
							<i class="el-icon-minus" />
						</span>
                        <span class="control-btn" @click="doMaximize">
							<i :class="state === 'normal' ? 'el-icon-full-screen' : 'el-icon-copy-document'" />
						</span>
                        <span class="control-btn" @click="doClose">
							<i class="el-icon-close" />
						</span>
                    </n-space>
                </div>
            </div>
            <div class="main-container" :style="main_container_fix_style">
                <slot name="main-panel"></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { NxNavbar, NxToolbar } from "@/layout/components";
import * as EventBus from '@/services/eventbus'
import { computed, getCurrentInstance, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useSettingStore } from "@/store";
import { useI18n } from "vue-i18n-bridge";

const { t } = useI18n()
const IS_MAC_OS = /macintosh/i.test(navigator.userAgent)

const isMainWindow = ref(true)
const leftPanelWidth = ref(IS_MAC_OS ? 60 : 50)
const leftPanel = ref(true)
const topPanel = ref(true)
const state = ref('normal')
const active = ref(true)
const window = ref()
const showLayout = ref(false)
const settingStore = useSettingStore()
const { layoutMode } = storeToRefs(settingStore)

const main_container_fix_style = computed(() => topPanel ? {} : { height: '100%' })

function setWindowHandlers() {
    // @ts-ignore
    const currentWindow = powertools.getCurrentWindow()
    window.value = currentWindow

    currentWindow.on('blur', () => {
        active.value = false
    })

    currentWindow.on('focus', () => {
        active.value = true
    })

    currentWindow.on('maximize', () => {
        state.value = 'maximize'
    })

    currentWindow.on('unmaximize', () => {
        state.value = 'normal'
    })
}

function workaroundLinuxMaxMinEvent(status) {
    // @ts-ignore
    // electron version < 17.xx ,it not emit maximize/unmaximize events
    const os = powertools.getostype()
    if (os === 'Linux') {
        state.value = status
    }
}

function doMinimize() {
    // @ts-ignore
    window.value.minimize()
    workaroundLinuxMaxMinEvent('normal')
}

function doMaximize() {
    if (state.value === 'normal') {
        // @ts-ignore
        window.value.maximize()
        workaroundLinuxMaxMinEvent('maximize')
    } else {
        // @ts-ignore
        window.value.unmaximize()
        workaroundLinuxMaxMinEvent('normal')
    }
}

function doClose() {
    window.value.close()
}

function changeLayout(event) {
    const element = event.currentTarget
    const layout = element.getAttribute('data-layout')
    settingStore.updateLayoutMode(layout)
}

const proxy = getCurrentInstance()?.proxy
const { configPanel } = storeToRefs(useSettingStore())

onMounted(() => {
    setWindowHandlers()
	// 检测是否需要显示会话布局
    // @ts-ignore
    const sessions = proxy && proxy.$sessionManager.getSessionIntances()
    EventBus.subscript('instance-created', () => {
        showLayout.value = sessions.some((x) => x.type === 'shell')
    })
    EventBus.subscript('instance-close', () => {
        showLayout.value = sessions.some((x) => x.type === 'shell')
    })
    EventBus.subscript('enter-fullscreen', async () => {
        try {
            leftPanel.value = false
            topPanel.value = false
            EventBus.publish('session-config-panel', 'close')
            await document.body.requestFullscreen()
        } catch (e) {
            // pass
        }
    })
    document.addEventListener('fullscreenchange', () => {
        const isFullscreen = !!document.fullscreenElement
        if (!isFullscreen) {
            if (configPanel.value) {
                EventBus.publish('session-config-panel', 'open')
            }
            leftPanel.value = true
            topPanel.value = true
        }
    })
})
</script>

<style lang="scss">
@import '@/assets/scss/_const.scss';

.pt-window {
  display: flex;
  position: relative;
  box-sizing: border-box;

  width: 100%;
  height: 100%;
  min-width: 1000px;

  .left-panel {
    height: 100%;
    background-color: var(--n-bg-color-base);
    backdrop-filter: blur(5px);
  }

  .main-panel {
    width: calc(100vw - 50px);
    height: 100%;

    .title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      width: 100%;
      background-color: var(--n-bg-color-base);
      backdrop-filter: blur(5px);

      &.drag {
        -webkit-app-region: drag;
      }

      .title-bar-search {
        width: 270px;
        z-index: 3000;
        -webkit-app-region: no-drag;
      }

      .window-controls-container {
        display: flex;
        flex-grow: 0;
        flex-shrink: 0;
        padding: 0 10px;
        -webkit-app-region: no-drag;

        .n-layout-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .n-layout-button {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            color: var(--n-text-color-base);
            padding: 5px;
            border-radius: 4px;

            &:hover {
              background-color: var(--n-hover-bg-color);
            }

            &:not(:last-child) {
              margin-right: 4px;
            }
          }

          .is-active {
            background-color: var(--n-hover-bg-color);
            color: var(--n-text-color-active);
          }
        }

        .control-btn {
          display: inline-block;
          width: 32px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          color: var(--n-text-color-base);

          &:hover {
            cursor: pointer;
            color: var(--n-text-color-light);
            background-color: var(--n-hover-bg-color);
          }
        }
      }
    }

    .main-container {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      height: calc(100% - #{$titleBarHeight});
    }
  }
}
</style>
