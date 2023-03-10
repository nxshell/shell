<template>
	<el-dialog
		:title="$t('components.auth.title')"
		:visible.sync="showDialog"
		:append-to-body="true"
		width="400px"
		:close-on-click-modal="false"
	>
		<div v-if="type === 'auth'">
			<el-form label-position="left" label-width="80px" @submit.native.prevent>
				<el-form-item :label="$t('components.auth.authType.title')">
					<el-select v-model="authType" style="width: 100%;">
						<el-option v-for="item in options" :key="item.value" :label="$t(item.label)" :value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item
					v-if="['password','publickey','keyboard-interactive'].includes(authType)"
					:label="$t('components.auth.username.title')"
				>
					<el-input v-model="authUserName" :placeholder="authUserName" disabled />
				</el-form-item>
				<el-form-item v-if="authType === 'password'" :label="$t('components.auth.password.title')">
					<el-input ref="password" type="password" v-model="authPassword" @keydown.enter.native="doOK" />
				</el-form-item>
				<el-form-item v-if="authType === 'publickey'" :label="$t('components.auth.publickey.title')">
					<pt-file v-model="authPublicKey" type="text" />
				</el-form-item>
				<el-form-item v-if="authType === 'publickey'" :label="$t('components.auth.passphrase.title')">
					<el-input v-model="authPassphrase" type="password" @keydown.enter.native="doOK" />
				</el-form-item>
			</el-form>
		</div>
		<el-form v-else-if="type === 'username'" label-position="left" label-width="80px" @submit.native.prevent>
			<el-form-item :label="$t('components.auth.username.title')">
				<el-input ref="username" type="text" v-model="authUserName" @keydown.enter.native="doOK" />
			</el-form-item>
		</el-form>
		<div class="prompt" v-else>
			<div>{{ promptName }}</div>
			<el-input ref="prompt" type="text" v-model="promptValue" />
		</div>
		<div slot="footer" class="dialog-footer">
			<el-button @click="handleCancel">{{ $t('components.Cancel') }}</el-button>
			<el-button type="primary" @click="doOK">{{ $t('components.OK') }}</el-button>
		</div>
	</el-dialog>
</template>

<script>
export default {
	name: 'PtAuthDialog',
	components: {},
	props: {},
	data() {
		return {
			showDialog: false,
			authType: '',
			type: 'auth',
			data: [],
			options: [],
			authUserName: '',
			authPassword: '',
			authPublicKey: '',
			authPassphrase: '',
			promptValue: ''
		}
	},

	computed: {
		promptName() {
			const prompt = this.data[0]
			if (prompt) {
				return prompt.prompt
			} else {
				return ''
			}
		}
	},

	created() {
	},

	mounted() {
	},

	methods: {
		show(data) {
			let dofocus = () => {
			}
			if (data.type === 'authDialog') {
				this.data = data.data
				this.type = 'auth'
				this.authUserName = data.username
				this.authOptions()
				dofocus = () => {
					setTimeout(() => {
						this.$refs.password.focus()
					})
				}
			} else if (data.type === 'authPrompt') {
				this.data = data.data
				this.type = 'prompt'
				dofocus = () => {
					setTimeout(() => {
						this.$refs.prompt.focus()
					})
				}
			} else if (data.type === 'username') {
				this.type = 'username'
				dofocus = () => {
					setTimeout(() => {
						this.$refs.username.focus()
					})
				}
			}
			this.showDialog = true
			dofocus()
		},

		authOptions() {
			const methods = this.data
			let options = []
			if (methods.indexOf('password') >= 0) {
				options.push({
					label: 'password',
					value: 'password'
				})
			}
			if (methods.indexOf('publickey') >= 0) {
				options.push({
					label: 'publickey',
					value: 'publickey'
				})
			}
			if (methods.indexOf('keyboard-interactive') >= 0) {
				options.push({
					label: 'keyboard-interactive',
					value: 'keyboard-interactive'
				})
			}
			this.options = options

			if (options.length) {
				this.authType = options[0].value
			}
		},
		handleOk() {
			if (this.type === 'auth') {
				if (this.authType === 'password') {
					this.$emit('authOk', { type: 'password', username: this.authUserName, password: this.authPassword })
				} else if (this.authType === 'publickey') {
					this.$emit('authOk', {
						type: 'publickey',
						username: this.authUserName,
						passphrase: this.authPassphrase,
						publickey: this.authPublicKey ? this.authPublicKey[0].data : ''
					})
				} else if (this.authType === 'keyboard-interactive') {
					this.$emit('authOk', { type: 'keyboard-interactive', username: this.authUserName })
				}
			} else if (this.type === 'username') {
				this.$emit('authOk', { type: 'username', username: this.authUserName })
			} else {
				this.$emit('authOk', { type: 'prompt', data: [this.promptValue] })
			}
		},

		doOK() {
			this.showDialog = false
			this.handleOk()
		},

		handleCancel() {
			this.$emit('authOk', { type: 'cannel' })
			this.showDialog = false
		}
	}
}
</script>

<style lang="scss">
@import '../../../assets/scss/_const.scss';

.pt-select {
	position: relative;
	box-sizing: border-box;
	border-radius: 2px;
	outline: none;

	height: $selectHeight;

	border: solid 1px var(--n-bg-color-base);
}
</style>
