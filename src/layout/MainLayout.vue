<template>
	<div class="nx-layout-wrapper">
		<div v-show="configPanel" class="nx-layout-left">
			<nx-menus ref="menuRef" />
		</div>
		<div class="nx-layout-right" :style="{width: `calc(100% - ${configPanel ? 295 : 0}px)`}">
			<div
				class="nx-layout-toggle-bar"
				:class="{'nx-layout-toggle-bar--collapsed': configPanel}"
				@click="handlerCollapsed"
			>
				<div class="nx-layout-toggle-bar__top"></div>
				<div class="nx-layout-toggle-bar__bottom"></div>
			</div>
			<nx-tab-menu v-if="showTabs" />
			<div class="nx-content" :style="{height: `calc(100% - ${showTabs ? '40px':'0px' })`}">
				<keep-alive :exclude="['GlobalSetting', 'lock']">
					<router-view />
				</keep-alive>
			</div>
		</div>
	</div>
</template>
<script setup>
import * as EventBus from '@/services/eventbus'
import { NxMenus, NxTabMenu } from './components'
import { storeToRefs } from 'pinia'
import { getCurrentInstance, onBeforeMount } from "vue";
import { useNxTabsStore } from '@/store'

const { configPanel, showTabs } = storeToRefs(useNxTabsStore())
const proxy = getCurrentInstance()?.proxy

const handlerCollapsed = () => {
	const action = configPanel.value ? 'close' : 'open'
	configPanel.value = !configPanel.value
	EventBus.publish('session-config-panel', action)
}

onBeforeMount(async () => {
	// @ts-ignore
	const sessionManager = proxy.$sessionManager
	// 避免重复创建欢迎会话实例
	if (!sessionManager.getSessionIntances().find((x) => x.name === 'Welcome')) {
		await sessionManager.createWelcomeSessionInstance()
	}
})

</script>

<style lang="scss" scoped>
// 左侧工具栏宽度
$tool-box-width: 295px;
// 顶部Tabs 高度
$nx-content-tabs: 40px;
.nx-layout-wrapper {
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	box-sizing: border-box;

	.nx-layout-left {
		width: $tool-box-width;
		height: calc(100vh - 40px);
		box-sizing: border-box;
		padding: 5px 5px 0;
	}

	.nx-layout-right {
		position: relative;
		width: calc(100% - #{$tool-box-width});
		height: calc(100vh - 40px);
		box-sizing: border-box;

		.nx-layout-toggle-bar {
			height: 72px;
			width: 32px;
			position: absolute;
			top: calc(50% - 36px);
			left: -15px;
			z-index: 100;

			&__top,
			&__bottom {
				position: absolute;
				width: 4px;

				border-radius: 2px;
				height: 38px;
				left: 14px;
				transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
				transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				background-color: rgba(191, 191, 191, 1);
			}

			&__bottom {
				position: absolute;
				top: 34px;
			}

			&:hover {
				cursor: pointer;

				.nx-layout-toggle-bar__top {
					transform: rotate(-12deg) scale(1.15) translateY(-2px);
				}

				.nx-layout-toggle-bar__bottom {
					transform: rotate(12deg) scale(1.15) translateY(2px);
				}
			}

			&--collapsed:hover {
				.nx-layout-toggle-bar__top {
					transform: rotate(12deg) scale(1.15) translateY(-2px);
				}

				.nx-layout-toggle-bar__bottom {
					transform: rotate(-12deg) scale(1.15) translateY(2px);
				}
			}
		}

		.nx-content {
			height: calc(100vh - #{$nx-content-tabs});
		}
	}
}
</style>
