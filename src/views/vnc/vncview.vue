<template>
	<div class="pt-vnc-view">
		<pt-toolbar :height="40">
			<n-icon
				name="copy"
				slot="left"
				size="medium"
				:title="$t('home.session-instance.ctrldelete')"
				flat
				@click="sendCtrlAltDel"
			/>
			<n-icon
				name="refresh"
				slot="left"
				:title="$t('home.session-instance.reconnect')"
				@click="reconnect"
			/>
			<el-input v-model="url" readonly slot="center" />
			<n-icon
				type="img"
				:name="shutdownIcon"
				slot="right"
				size="24"
				:title="$t('home.session-instance.shutdown')"
				@click="shutdown"
			/>
		</pt-toolbar>
		<div ref="screen" class="screen">
			<!-- This is where the remote screen will appear -->
		</div>

		<pt-auth-dialog ref="dialog" @authOk="handleAuthOk" />
	</div>
</template>

<script>
import FileView from '../components/fileview/fileview'
import PtAuthDialog from '../components/auth/auth'
import shutdownIcon from '../../assets/images/shutdown.png'
import RFB from 'nxshell-vnc'

export default {
	name: 'PtVncView',
	components: {
		FileView,
		PtAuthDialog
	},
	props: {
		mode: {
			type: String,
			default: 'full'
		},
		sessionId: {
			type: Number
		}
	},

	data() {
		return {
			status_text: 'Loading',
			host: 'localhost',
			port: 5900,
			url: '',
			shutdownIcon: shutdownIcon
		}
	},

	computed: {},

	mounted() {
		this.init()
	},

	methods: {
		handleAuthOk(data) {
			this.sessionInstance.sendControlData(data)
		},
		init() {
			// RFB holds the API to connect and communicate with a VNC server
			let rfb
			let sessionInstance = this.$sessionManager.getSessionInstanceById(this.sessionId)
			sessionInstance.on('close', () => {
				// destroy vnc instance
				try {
					this.$destroy()
					this.$el.parentNode.removeChild(this.$el)
				} catch (e) {
					console.log('vnc instance remove error', e)
				}
			})

			const config = sessionInstance.cfg
			// Read parameters specified in the URL query string
			// By default, use the host and port of server that served this file
			this.host = config.hostAddress
			this.port = config.hostVncPort
			this.password = config.password
			this.username = config.username
			this.url = `vnc://${this.host}:${this.port}`

			this.status('Connecting')
			let url = `ws://${this.host}:${this.port}`
			// Creating a new RFB object will start a new connection
			rfb = new RFB(this.$refs.screen, url)
			this.rfb = rfb

			// Add listeners to important events from the RFB module
			rfb.addEventListener('connect', () => {
				this.connectedToServer()
			})
			rfb.addEventListener('disconnect', (e) => {
				this.disconnectedFromServer(e)
			})
			rfb.addEventListener('credentialsrequired', (e) => {
				this.credentialsAreRequired(e)
			})
			rfb.addEventListener('desktopname', (e) => {
				this.updateDesktopName(e)
			})
			rfb.addEventListener('clipboard', (e) => {
				this.clipborad(e)
			})

			// Set parameters that can be changed on an active connection
			rfb.viewOnly = false
			rfb.scaleViewport = true
			rfb.resizeSession = true

			this.resizeObject = new ResizeObserver((e) => {
				this.rfb.scaleViewport = true
			})
			this.resizeObject.observe(this.$refs.screen)
		},
		credentialsAreRequired(e) {
			if (this.username && this.password) {
				this.rfb.sendCredentials({username: this.username, password: this.password})
				return
			}
			let auths = e.detail.types
			this.credentials = {}
			this.handleAuth(auths)
		},
		handleAuth(auths) {
			if (!auths.length) {
				this.rfb.sendCredentials(this.credentials)
				return
			}
			this.cur_auth = auths.shift()
			this.auths = auths
			this.$refs.dialog.show({type: 'authPrompt', data: [{prompt: this.cur_auth}]})
		},
		handleAuthOk(e) {
			if (e.type !== 'cannel') {
				this.credentials[this.cur_auth] = e.data[0]
			}
			this.handleAuth(this.auths)
		},
		status(text) {
			this.status_text = text
		},
		disconnectedFromServer(e) {
			if (e.detail.clean) {
				this.status('Disconnected')
			} else {
				this.warn('Connection is closed')
			}
		},
		connectedToServer(e) {
			this.status('Connected to ' + this.desktopName)
		},
		updateDesktopName(e) {
			this.desktopName = e.detail.name
		},
		sendCtrlAltDel() {
			if (this.rfb) {
				this.rfb.scaleViewport = true
				this.rfb.sendCtrlAltDel()
			}
		},
		shutdown() {
			if (this.rfb) {
				this.rfb.machineShutdown()
			}
		},
		reconnect() {
			if (this.rfb) {
				this.rfb.disconnect()
				this.rfb = null
			}
			this.init()
		},
		clipborad(e) {
			const text = e.detail.text
			console.log('clipborad is ', text, e)
		},

		warn(info) {
			this.$confirm(info, 'VNC', {type: 'warning'})
		}
	},

	async beforeDestroy() {
		if (this.rfb) {
			this.rfb.disconnect()
			this.rfb = null
		}
		if (this.resizeObject) {
			this.resizeObject.disconnect()
			this.resizeObject = null
		}
	}
}
</script>

<style lang="scss">
.pt-vnc-view {
	height: 100%;
	width: 100%;

	.top_bar {
		width: 100%;
		height: 40px;
	}

	.screen {
		width: 100%;
		height: calc(100% - 40px);
	}
}
</style>
