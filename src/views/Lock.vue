<template>
	<div class="lock-page">
		<div class="n-lock-config">
			<div class="n-lock-config__header">
				<n-space v-if="lock">
					<i class="el-icon-lock"></i>
					{{ $t('lock.lock_desc') }}
				</n-space>
				<n-space v-else>
					<i class="el-icon-unlock"></i>
					{{ $t('lock.unlock_desc') }}
				</n-space>
			</div>
			<el-form ref="form" label-width="80px" @submit.native.prevent>
				<el-form-item v-if="lock" :label="$t('lock.password_desc')">
					<el-input
						v-model="password"
						:type="`${showPassword ? 'text' : 'password'}`"
						:placeholder="$t('lock.placeholder')"
					>
						<n-icon
							slot="suffix"
							:name="`${showPassword ? 'eye-open' : 'eye-close'}`"
							size="15"
							@click="handleShowPassword"
						/>
					</el-input>
				</el-form-item>
				<el-form-item v-if="lock" :label="$t('lock.password_verify')">
					<el-input
						v-model="password_verify"
						:type="`${showPasswordVerify ? 'text' : 'password'}`"
						:placeholder="$t('lock.placeholder-verify')"
					>
						<n-icon
							slot="suffix"
							:name="`${showPasswordVerify ? 'eye-open' : 'eye-close'}`"
							size="15"
							@click="showPasswordVerify = !showPasswordVerify"
						/>
					</el-input>
				</el-form-item>
				<el-form-item v-if="!lock" :label="$t('lock.unlock_password_desc')">
					<el-input
						v-model="password_input"
						:type="`${showUnlockPassword ? 'text' : 'password'}`"
						:placeholder="$t('lock.placeholder')"
					>
						<n-icon
							slot="suffix"
							:name="`${showUnlockPassword ? 'eye-open' : 'eye-close'}`"
							size="15"
							@click="showUnlockPassword = !showUnlockPassword"
						/>
					</el-input>
				</el-form-item>
			</el-form>
			<div v-if="lock" class="n-lock-config__footer">
				<n-space :size="105">
					<el-button @click="back">{{ $t('components.Cancel') }}</el-button>
					<el-button type="primary" @click="handleOk">{{ $t('components.OK') }}</el-button>
				</n-space>
			</div>
			<div v-else class="n-lock-config__footer">
				<el-button type="primary" @click="handleUnLock">{{ $t('components.OK') }}</el-button>
			</div>
		</div>
	</div>
</template>

<script>
import {mapState, mapMutations} from 'vuex'

export default {
	data() {
		return {
			lock: true,
			password: '',
			password_verify: '',
			password_input: '',
			showPassword: false,
			showPasswordVerify: false,
			showUnlockPassword: false
		}
	},
	computed: {
		...mapState(['userLock'])
	},
	methods: {
		...mapMutations(['setUserLock']),
		back() {
			this.$router.back()
		},

		handleOk() {
			if (this.password == this.password_verify) {
				this.lock = false
				this.setUserLock(false)
			} else {
				this.$message({
					message: '请确认输入的密码',
					type: 'error'
				})
			}
		},
		handleShowPassword() {
			this.showPassword = !this.showPassword
		},
		handleUnLock() {
			if (this.password_input == this.password) {
				this.lock = true
				this.password_input = ''
				this.setUserLock(true)
				this.back()
			} else {
				this.$message({
					message: '密码输入错误！',
					type: 'error'
				})
			}
		}
	}
}
</script>

<style lang="scss">
.lock-page {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	font-size: 20px;
	color: var(--n-text-color-base);
	background-color: var(--n-bg-color-base);
	.n-lock-config {
		&__header {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 80px;
			font-size: 20px;
			font-weight: 800;
		}
		&__footer {
			display: flex;
			justify-content: flex-end;
			align-items: center;
		}
	}
}
</style>
