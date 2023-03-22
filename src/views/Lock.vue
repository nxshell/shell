<template>
	<div class="lock-page">
		<div class="n-lock-config">
			<div class="n-lock-config__header">
				<n-space v-if="!userLock">
					<i class="el-icon-lock"></i>
					{{ t('lock.lock_desc') }} {{ aa }} {{ userLock }}
				</n-space>
				<n-space v-else>
					<i class="el-icon-unlock"></i>
					{{ t('lock.unlock_desc') }}
				</n-space>
			</div>
			<el-form ref="lockFormRef" :model="lockForm" :rules="rules" label-width="100px" @submit.native.prevent>
				<el-form-item v-if="!userLock" prop="password" :label="t('lock.password_desc')">
					<el-input v-model="lockForm.password" :placeholder="t('lock.placeholder')" show-password />
				</el-form-item>
				<el-form-item v-if="!userLock" prop="verify" :label="t('lock.password_verify')">
					<el-input v-model="lockForm.verify" :placeholder="t('lock.placeholder')" show-password />
				</el-form-item>
				<el-form-item v-if="userLock" prop="password_input" :label="t('lock.unlock_password_desc')">
					<el-input v-model="lockForm.password_input" :placeholder="t('lock.placeholder')" show-password />
				</el-form-item>
			</el-form>
			<div v-if="!userLock" class="n-lock-config__footer">
				<n-space :size="105">
					<el-button @click="back">{{ t('components.Cancel') }}</el-button>
					<el-button type="primary" @click="handleOk">{{ t('components.OK') }}</el-button>
				</n-space>
			</div>
			<div v-else class="n-lock-config__footer">
				<el-button type="primary" @click="handleUnLock">{{ t('components.OK') }} ass</el-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useSettingStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n-bridge'
import { Message } from 'element-ui'
import { useRouter } from 'vue-router/composables'

const { t } = useI18n()
const lockFormRef = ref()
const settingStore = useSettingStore()
const { userLock } = storeToRefs(settingStore)
const aa = computed(() => settingStore.userLock)

const router = useRouter()

const lockForm = reactive({
	password: '',
	verify: '',
	password_input: ''
})

const validatePass = (rule, value, callback) => {
	if (value === '') {
		callback(new Error('请输入密码'))
	} else {
		if (lockForm.verify !== '') {
			lockFormRef.value?.validateField('checkPass')
		}
		callback()
	}
}
const validatePass2 = (rule, value, callback) => {
	if (value === '') {
		callback(new Error('请再次输入密码'))
	} else if (value !== lockForm.password) {
		callback(new Error('两次输入密码不一致!'))
	} else {
		callback()
	}
}
const rules = {
	password: [{ validator: validatePass, trigger: 'blur' }],
	verify: [{ validator: validatePass2, trigger: 'blur' }]
}

const back = () => {
	router.back()
}
const handleOk = () => {
	lockFormRef.value?.validate((valid) => {
		if (valid) {
			alert('submit!')
			userLock.value = true
		} else {
			return false
		}
	})
}
const handleUnLock = () => {
	// if (password_input.value === password.value) {
	// 	userLock.value = false
	// 	password_input.value = ''
	// 	back()
	// } else {
	// 	Message.error('密码输入错误！')
	// }
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
