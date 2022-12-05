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
						<el-tooltip class="item" effect="dark" :content="T('home.session-instance.context-menu.split-normal')" placement="top-start">
							<span class="n-layout-button" :class="{'is-active':currentLayout === 'normal'}" data-layout="normal" @click="changeLayout">
								<n-icon name="layout-alone" size="16" />
							</span>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" :content="T('home.session-instance.context-menu.split-row')" placement="top-start">
							<span class="n-layout-button" :class="{'is-active':currentLayout === 'row'}" data-layout="row" @click="changeLayout">
								<n-icon name="layout-row" size="16" />
							</span>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" :content="T('home.session-instance.context-menu.split-column')" placement="top-start">
							<span class="n-layout-button" :class="{'is-active':currentLayout === 'col'}" data-layout="col" @click="changeLayout">
								<n-icon name="layout-col" size="16" />
							</span>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" :content="T('home.session-instance.context-menu.split-grid')" placement="top-start">
							<span class="n-layout-button" :class="{'is-active':currentLayout === 'grid'}" data-layout="grid" @click="changeLayout">
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

<script>
import { NxNavbar, NxToolbar } from "@/layout/components";
import * as EventBus from '@/services/eventbus'

const IS_MAC_OS = /macintosh/i.test(navigator.userAgent)
export default {
	name: 'NxLayout',
	components: { NxToolbar, NxNavbar },
	props: {
		isMainWindow: {
			type: Boolean,
			default: false
		},
		leftPanelWidth: {
			type: Number,
			default: IS_MAC_OS ? 60 : 50
		},
		leftPanel: {
			type: Boolean,
			default: false
		},
		topPanel: {
			type: Boolean,
			default: true
		},
		title: {
			type: String,
			default: ''
		}
	},

	data() {
		return {
			IS_MAC_OS,
			state: 'normal',
			active: true,
			window: null,
			showLayout: false,
			currentLayout: 'normal'
		}
	},
	computed: {
		main_container_fix_style() {
			return this.topPanel ? {} : { height: '100%' }
		}
	},
	created() {
		this.setWindowHandlers()
		EventBus.subscript('instance-created', () => {
			const sessions = this.$sessionManager.getSessionIntances()
			this.showLayout = sessions.some(x => x.type === 'shell')
		})
		EventBus.subscript('instance-close', () => {
			const sessions = this.$sessionManager.getSessionIntances()
			this.showLayout = sessions.some(x => x.type === 'shell')
		})
	},

	methods: {

		setWindowHandlers() {
			const currentWindow = powertools.getCurrentWindow()
			this.window = currentWindow

			currentWindow.on('blur', () => {
				this.active = false
			})

			currentWindow.on('focus', () => {
				this.active = true
			})

			currentWindow.on('maximize', () => {
				this.state = 'maximize'
			})

			currentWindow.on('unmaximize', () => {
				this.state = 'normal'
			})
		},

		workaroundLinuxMaxMinEvent(status) {
			// electron version < 17.xx ,it not emit maximize/unmaximize events
			const ostype = powertools.getostype()
			if (ostype === 'Linux') {
				this.state = status
			}
		},

		doMinimize() {
			this.window.minimize()
			this.workaroundLinuxMaxMinEvent('normal')
		},

		doMaximize() {
			if (this.state === 'normal') {
				this.window.maximize()
				this.workaroundLinuxMaxMinEvent('maximize')
			} else {
				this.window.unmaximize()
				this.workaroundLinuxMaxMinEvent('normal')
			}
		},

		doClose() {
			this.window.close()
		},
		changeLayout(event) {
			const element = event.currentTarget
			const layout = element.getAttribute('data-layout')
			if (this.currentLayout !== layout) {
				this.currentLayout = layout
				EventBus.publish('change-layout', layout)
			}
		}
	}
}
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
