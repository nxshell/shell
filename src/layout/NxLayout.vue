<template>
	<div class="pt-window" :class="{ 'not-macos': !IS_MAC_OS }">
		<div class="left-panel" v-if="leftPanel" :style="{ width: leftPanelWidth + 'px' }">
			<nx-navbar />
		</div>
		<div class="main-panel">
			<div class="title-bar" :class="{ drag: isMainWindow, deactive: !active }">
				<toolbar :visible="true" class="title-text" />
				<div class="window-controls-container" v-if="!IS_MAC_OS">
					<n-space :size="20">
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
import Toolbar from "@/views/components/toolbar";
import NxNavbar from '@/layout/components/NxNavbar'

const IS_MAC_OS = /macintosh/i.test(navigator.userAgent)
export default {
	name: 'NxLayout',
	components: { Toolbar, NxNavbar },
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
			window: null
		}
	},
	computed: {
		main_container_fix_style() {
			return this.topPanel ? {} : { height: '100%' }
		}
	},

	created() {
		this.setWindowHandlers()
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

	&.not-macos {
		// border: 1px solid var(--windowBorderColor);
	}

	.left-panel {
		height: 100%;
		background-color: var(--n-bg-color-base);
		//border-right: 1px solid var(--lightBackgroundColor);
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

				.control-btn {
					display: inline-block;
					width: 32px;
					height: 32px;
					line-height: 32px;
					text-align: center;
					color: var(--n-text-color-base);

					&:hover {
						cursor: pointer;
						color: #ffffff;
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
