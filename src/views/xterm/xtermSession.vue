<template>
	<div class="pt-xterm-session">
		<div class="xterm-container" ref="xterm_container">
			<!-- <pt-xterm ref="xterm" @key="onXtermKey" @resize="onXtermResize"/> -->
			<xterm-instance
				v-for="(sessId, idx) in sessions"
				:key="sessId"
				:style="xtermWrapper"
				class="xterm-wrapper"
				v-show="xtermShow(sessId)"
				:sessionInstanceId="sessId"
				@split_screen="handleSplit"
				@titleChange="onTitleChange"
				@change-theme="handleChangeTheme($event, sessId)"
				@remove-session="removeSession(idx)" />
		</div>
	</div>
</template>

<script>
import XtermInstance from './xtermInstance'
import * as EventBus from '@/services/eventbus'

export default {
	name: 'PtXtermSession',
	components: {
		XtermInstance
	},
	data() {
		return {
			sessions: [],
			currentSessionId: -1,
			sessionIdMapSftpDir: {},
			tunnelMapTitle: {},
			themes: {},
			split_type: 'normal',
			width: 0
		}
	},

	computed: {
		currentSessionInfo() {
			const currentSessionInfo = {
				url: ''
			}
			if (this.currentSessionId === -1) {
				return currentSessionInfo
			}
			const sessionConfig = this.$sessionManager.getSessionConfigByInstanceId(this.currentSessionId)
			if (!sessionConfig) {
				return currentSessionInfo
			}

			currentSessionInfo.url = this.genrateUrlBySessionCfg(sessionConfig.config)
			return currentSessionInfo
		},
		tunnelTitle() {
			return this.tunnelMapTitle[this.currentSessionId]
		},
		backgroundColor() {
			return {
				backgroundColor: this.themes[this.currentSessionId]?.background || 'black'
			}
		},
		toolbarShow() {
			const sessionConfig = this.$sessionManager.getSessionConfigByInstanceId(this.currentSessionId)
			return sessionConfig && sessionConfig.config.protocal === 'ssh';
		},
		xtermWrapper() {
			let width = '100%'
			let height = '100%'
			let min_width = 200
			let t_len = this.sessions.length
			let f_len = Math.floor((t_len + 1) / 2)

			if (this.split_type === 'grid') {
				if (t_len < 3) {
					height = '100%'
					width = Math.floor(100 / t_len)
					width = width + '%'
				} else {
					height = '50%'
					width = Math.floor(100 / f_len)
					width = width + '%'
					min_width = Math.floor(this.width / f_len)
				}
			} else if (this.split_type === 'col') {
				height = '100%'
				width = Math.floor(100 / t_len)
				width = width + '%'
				min_width = Math.floor(this.width / t_len)
			} else if (this.split_type === 'row') {
				width = '100%'
				height = Math.floor(100 / t_len)
				height = height + '%'
			}

			return {
				width,
				height,
				'min-width': `${ min_width }px`
			}
		}
	},

	created() {
	},

	mounted() {
		this.$nextTick(() => {
			this.getxtermwitdh()
		})
		EventBus.subscript('change-layout', (type) => {
			this.split_type = type
		})
	},

	beforeRouteUpdate(to, from, next) {
		if (to.path !== from.path) {
			let sessionId = parseInt(to.params.sessionId)
			this.currentSessionId = sessionId
			this.addSession(sessionId)
			if (!this.tunnelMapTitle[sessionId]) {
				this.updateTunnelTitle(sessionId, this.T('home.session-instance.tunnel'))
			}
		}
		next()
	},

	activated() {
		this.currentSessionId = parseInt(this.$route.params.sessionId)
		this.addSession(this.currentSessionId)
		if (!this.tunnelMapTitle[this.currentSessionId]) {
			this.updateTunnelTitle(this.currentSessionId, this.T('home.session-instance.tunnel'))
		}
	},

	deactivated() {
	},

	methods: {
		getxtermwitdh() {
			let width = this.$refs.xterm_container.clientWidth
			if (this.width != width) {
				this.width = width
			}
		},
		genrateUrlBySessionCfg(config) {
			let url = ''
			if (config.protocal == 'ssh') {
				const { hostAddress, hostPort, username, password, authType } = config
				// URL对于SSH这种自定义protocol的解析都是当做类似file的解析方式
				// 为了更方便的处理，这里先用http代替protocol ssh
				let sessionURL = {}
				try {
					sessionURL = new URL(`http://${ hostAddress || 'localhost' }`)
				} catch (e) {
					sessionURL.href = `ssh://${ username }:****@${ hostAddress }:${ hostPort }`
				}

				sessionURL.port = hostPort || 22
				if (username) {
					sessionURL.username = username
				}
				if (authType === 'password' && password) {
					sessionURL.password = '*'.padStart(4, '*')
				}
				// 把输出的http协议转换为ssh
				url = sessionURL.href.replace('http', 'ssh')
			} else if (config.protocal == 'telnet') {
				const { hostAddress, hostTelnetPort, username, password } = config
				url = `telnet://${ hostAddress }:${ hostTelnetPort }`
			} else if (config.protocal == 'localshell') {
				url = 'LocalShell Tool'
			} else {
				// serial protocol
				const { port } = config
				url = `serial@${ port }`
			}
			return url
		},
		updateTunnelTitle(id, title) {
			this.$set(this.tunnelMapTitle, id, title)
		},
		addSession(sessId) {
			if (this.sessions.findIndex((v) => v == sessId) > -1) {
				return
			}
			this.sessions.push(sessId)
		},
		xtermShow(sessId) {
			if (this.split_type == 'normal') {
				return this.currentSessionId == sessId
			}
			return true
		},
		removeSession(idx) {
			this.sessions.splice(idx, 1)
		},
		copySession() {
			let sessionInstance = this.$sessionManager.getSessionInstanceById(this.currentSessionId)
			if (!sessionInstance) {
				return
			}
			this.$sessionManager.duplicateSshInstance(sessionInstance)
		},
		async reconSession() {
			let sessionInstance = this.$sessionManager.getSessionInstanceById(this.currentSessionId)
			if (!sessionInstance) {
				return
			}
			await sessionInstance.refresh()
		},

		async openTunnel() {
			const sessionInstance = this.$sessionManager.getSessionInstanceById(this.currentSessionId)
			const port = await sessionInstance.openTunnel()
			if (port) {
				this.updateTunnelTitle(this.currentSessionId, this.T('home.session-instance.tunnel-success', port))
			} else {
				this.updateTunnelTitle(this.currentSessionId, this.T('home.session-instance.tunnel'))
			}
		},

		async openSFTP() {
			// get reconnid
			let connId = -1
			try {
				const sessionInstance = this.$sessionManager.getSessionInstanceById(this.currentSessionId)
				connId = await sessionInstance.getTermConnId()
			} catch (e) {
				console.log('openSFTP ssh instance error ', e)
				return
			}

			const sessionConfig = this.$sessionManager.getSessionConfigByInstanceId(this.currentSessionId)
			const sftpDirt = this.sessionIdMapSftpDir[this.currentSessionId] || '/'
			let sftCfg = { ...sessionConfig }
			sftCfg.config = { ...sftCfg.config, sftpDirt: sftpDirt, connId: connId }
			this.$sessionManager.createSFTPSessionInstance(sftCfg)
		},
		onTitleChange({ sessionId, title }) {
			//TODO remove it mapper
			this.sessionIdMapSftpDir[sessionId] = title
		},
		handleChangeTheme(theme, sessionId) {
			this.$set(this.themes, sessionId, theme)
		},
		handleSplit(type) {
			if (type == 'row') {
				this.split_type = 'row'
			} else if (type == 'col') {
				this.split_type = 'col'
			} else if (type == 'grid') {
				this.split_type = 'grid'
			} else {
				// close
				this.split_type = 'normal'
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.pt-xterm-session {
	position: relative;

	width: 100%;
	height: 100%;

	.pt-icon {
		// margin-left: 5px;
		// margin-right: 5px;
		color: var(--secondaryTextColor);
		transition: color 0.2s;

		&:hover {
			color: var(--n-text-color-base);
			transition: color 0.2s;
		}
	}

	.xterm-container {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		height: 100%;
		overflow: hidden;

		.xterm-wrapper {
			flex-grow: 1;
		}
	}
}
</style>
