<template>
	<el-dialog
		:title="T('components.auth.title')"
		:visible.sync="showDialog"
		width="400px"
		:close-on-click-modal="false"
	>
		<div v-if="type === 'auth'">
			<pt-form-item :label="T('components.auth.authType.title')">
				<el-select v-model="authType" style="width: 100%;">
					<el-option v-for="item in options" :key="item.value" :label="T(item.label)" :value="item.value">
					</el-option>
				</el-select>
			</pt-form-item>
			<pt-form-item
				:label="T('components.auth.username.title')"
				v-if="authType === 'password' || authType === 'publickey' || authType === 'keyboard-interactive'"
			>
				<el-input v-model="authUserName" :placeholder="authUserName" disabled />
			</pt-form-item>
			<pt-form-item :label="T('components.auth.password.title')" v-if="authType === 'password'">
				<el-input ref="password" type="password" v-model="authPassword" @keydown.enter.native="doOK" />
			</pt-form-item>
			<pt-form-item :label="T('components.auth.publickey.title')" v-if="authType === 'publickey'">
				<pt-file v-model="authPublicKey" type="text" />
			</pt-form-item>
			<pt-form-item :label="T('components.auth.passphrase.title')" v-if="authType === 'publickey'">
				<el-input v-model="authPassphrase" type="password" @keydown.enter.native="doOK" />
			</pt-form-item>
		</div>
		<pt-form-item :label="T('components.auth.username.title')" v-else-if="type === 'username'">
			<el-input ref="username" type="text" v-model="authUserName" @keydown.enter.native="doOK" />
		</pt-form-item>
		<div class="prompt" v-else>
			<div>{{ promptName }}</div>
			<el-input ref="prompt" type="text" v-model="promptValue" />
		</div>
		<div slot="footer" class="dialog-footer">
			<el-button @click="handleCancel">取 消</el-button>
			<el-button type="primary" @click="handleOk">确 定</el-button>
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

	border: solid 1px var(--borderColor);
}
</style>
