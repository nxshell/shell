<template>
	<div class="pt-sftp-view">
		<file-view :getFs="getFs" :cwd="dir" :hostInfo="hostInfo"></file-view>
		<pt-auth-dialog ref="dialog" @authOk="handleAuthOk" />
	</div>
</template>

<script>
import FileView from '../components/fileview/fileview'
import PtAuthDialog from '../components/auth/auth'

export default {
	name: 'PtSftpView',
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
			currentDir: '/',
			getFs: null,
			dir: '/',

			hostInfo: {}
		}
	},

	created() {
		this.getFs = async () => {
			const sessionInstance = this.$sessionManager.getSessionInstanceById(this.sessionId)
			return await sessionInstance.getFs()
		}

		this.sessionInstance = this.$sessionManager.getSessionInstanceById(this.sessionId)

		this.sessionInstance.on('control', (data) => {
			this.$refs.dialog.show(data)
		})

		this.sessionInstance.on('close', () => {
			// destroy sftp instance
			this.$destroy()
			this.$el.parentNode.removeChild(this.$el)
		})

		const config = this.sessionInstance.cfg

		this.dir = config.sftpDirt
		this.hostInfo = {
			username: config.username,
			host: config.hostAddress,
			uuid: config.uuid
		}
	},

	methods: {
		handleOpenDir(dir) {},
		handleAuthOk(data) {
			this.sessionInstance.sendControlData(data)
		}
	},

	async beforeDestroy() {
		let fs = await this.getFs()
		fs.dispose()
	}
}
</script>

<style lang="scss">
.pt-sftp-view {
	position: relative;
	height: 100%;
	background-color: var(--n-bg-color-base);
}
</style>
