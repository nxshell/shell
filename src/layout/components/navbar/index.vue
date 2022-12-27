<template>
	<div class="pt-shell-app-nav-bar" :style="{padding: IS_MACOS ? '38px 10px 10px' : '0 10px 10x'}">
		<!-- Logo -->
		<div class="pt-logo">
			<el-avatar shape="square" fit="fill" size="small" :src="require('@/assets/logo.png')" />
		</div>
		<!-- 用户头像 -->
		<div v-if="false" class="capture" @click.prevent="doCapture">
			<n-icon type="img" :name="captureIcon" size="28" className="icon-setting" />
		</div>
		<!-- 设置相关 -->
		<div class="icon-setting-container">
			<n-space vertical align="center">
				<!-- 头像 -->
				<!--<el-avatar v-show="true" shape="square" fit="fill" :src="avatarUrl" @click="goto_login" />-->
				<el-button v-if="false" type="text" icon="el-icon-user" @click="goto_login"></el-button>
				<!-- 主题切换按钮 -->
				<el-dropdown trigger="click" placement="bottom-end" @command="toggleTheme">
					<el-button type="text" :icon="themeIcon" />
					<el-dropdown-menu class="theme-btn" slot="dropdown">
						<el-dropdown-item :disabled="theme === 'light'" command="light" icon="el-icon-sunny">
							{{ T('app.theme.light') }}
						</el-dropdown-item>
						<el-dropdown-item :disabled="theme === 'dark'" command="dark" icon="el-icon-moon">
							{{ T('app.theme.dark') }}
						</el-dropdown-item>
						<el-dropdown-item :disabled="theme === 'pink'" command="pink" icon="el-icon-grape">
							{{ T('app.theme.pink') }}
						</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
				<!-- 设置按钮 -->
				<el-button type="text" icon="el-icon-setting" @click="gotoGlobalSetting"></el-button>
				<!-- 版本信息 -->
				<el-tooltip v-if="needUpdate" effect="dark" :content="T('app.need-update')" placement="bottom">
					<el-button
						type="text"
						:class="{'version-btn': needUpdate}"
						icon="el-icon-sold-out"
						@click="handlerVersionUpdate"
					/>
				</el-tooltip>
				<el-tooltip v-else effect="dark" :content="`${T('app.current-version')} ${version}`">
					<el-button type="text" icon="el-icon-warning-outline"></el-button>
				</el-tooltip>
			</n-space>
		</div>
	</div>
</template>

<script>
import {mapMutations, mapState} from 'vuex'
import {SESSION_TYPES} from '@/services/session'
import {createLocalFs} from '@/services/nxsys/localfs'
import NxShellIcon from '@/assets/logo.png'
import VideoPlay from '@/assets/images/video.png'
import VideoPause from '@/assets/images/pause.png'
import axios from 'axios'
import semver from 'semver'

const IS_MACOS = /macintosh/i.test(navigator.userAgent)
export default {
	name: 'NxNavbar',
	data() {
		return {
			IS_MACOS,
			apps: [
				{
					text: 'NxShell',
					icon: NxShellIcon
				}
			],
			capture: false,
			fsClient: null,
			captureIcon: VideoPlay,
			sessionPanel: 'open',
			version: 'V1.0.0',
			needUpdate: false
		}
	},
	computed: {
		...mapState(['userInfo', 'userLock', 'theme']),
		avatarUrl() {
			return this.userInfo ? this.userInfo.user_avatar : ''
		},
		avatarName() {
			return this.userInfo ? this.userInfo.user_name : ''
		},
		themeIcon() {
			switch (this.theme) {
				case 'light':
					return 'el-icon-sunny'
				case 'pink':
					return 'el-icon-grape'
				case 'dark':
					return 'el-icon-moon'
				default:
					return 'el-icon-sunny'
			}
		}
	},
	created() {
		this.version = powertools.getVersion()
		this.checkAppVersion()
	},
	mounted() {
		this.setTheme(this.$store.getters.theme)
	},
	methods: {
		...mapMutations(['setTheme']),
		async checkAppVersion() {
			const versionUrl = 'http://106.15.238.81:56789/oauth/version'
			try {
				const {
					data: {version = ''}
				} = await axios.get(versionUrl, {timeout: 60 * 1000})
				if (version) {
					this.needUpdate = semver.gt(version, this.version)
				}
			} catch (e) {
				console.error('App版本检测异常', e)
			}
		},
		goto_login() {
			const loginInstances = this.$sessionManager.matchSessionInstanceBySessionType(SESSION_TYPES.LOGIN)
			if (loginInstances.length) {
				return
			}
			this.$sessionManager.createLoginSessionInstance()
		},

		gotoGlobalSetting() {
			if (this.userLock) {
				// not allow
				return
			}
			const globalSettingInstances = this.$sessionManager.matchSessionInstanceBySessionType(
				SESSION_TYPES.GLOBALSETTING
			)
			if (globalSettingInstances.length) {
				return
			}

			this.$sessionManager.createGlobalSettingSessionInstance()
		},

		doCapture(e) {
			if (this.capture) {
				this.capture = false
				this.captureIcon = VideoPlay
				this.saveCaptureFile()
			} else {
				this.capture = true
				this.captureIcon = VideoPause
				powertools.captureStart()
			}
		},

		async saveCaptureFile() {
			const save_buffer = await powertools.captureStop()
			const coreService = powertools.getService('powertools-core')
			const {canceled, filePath} = await coreService.showSaveDialog({
				defaultPath: `nxshell-capture-${Date.now()}.webm`
			})
			if (canceled) {
				return
			}
			if (!this.fsClient) {
				this.fsClient = await createLocalFs()
			}
			const w_handle = await this.fsClient.open(filePath, 'w')
			await this.fsClient.write(w_handle, save_buffer, 0, save_buffer.length, 0)
			this.fsClient.close(w_handle)
		},
		toggleTheme(theme) {
			window.document.documentElement.setAttribute('nx-theme', theme)
			this.setTheme(theme)
		},
		async handlerVersionUpdate() {
			// 外链打开github地址
			const update = 'https://github.com/nxshell/nxshell/releases'
			await powertools.openExterUrl(update)
		}
	}
}
</script>

<style lang="scss" scoped>
.theme-btn {
	padding: 5px;
	border-color: var(--n-bg-color-light);
	background-color: var(--n-bg-color-light);

	::v-deep .el-dropdown-menu__item:not(.is-disabled) {
		color: var(--n-text-color-base);
		border-radius: 4px;

		&:focus,
		&:not(.is-disabled):hover {
			background-color: var(--n-bg-color-base);
		}
	}

	.el-dropdown-menu__item {
		margin-bottom: 5px;
	}

	.is-disabled {
		border-radius: 4px;
		background-color: var(--n-bg-color-base);
	}

	::v-deep .popper__arrow {
		border-top-color: var(--n-bg-color-light) !important;

		&::after {
			border-top-color: var(--n-bg-color-light) !important;
		}
	}
}

.pt-shell-app-nav-bar {
	display: flex;
	flex-direction: column;
	align-content: center;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	height: 100vh;

	.pt-logo {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 40px;
		height: 40px;

		.el-avatar {
			background: transparent;
		}
	}

	.icon-setting-container {
		::v-deep .el-button {
			width: 40px;

			i {
				font-size: 20px;
			}

			&:hover {
				background-color: var(--n-hover-bg-color);
			}
		}

		.version-btn {
			color: #1de9b6 !important;
			text-shadow: 0 0 7px #1de9b6;
			animation: breathe 2.7s ease-in-out 0s infinite alternate;
			-webkit-animation: breathe 2.7s ease-in-out 0s infinite alternate;
		}
	}
}
</style>
