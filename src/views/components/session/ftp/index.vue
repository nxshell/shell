<template>
	<el-dialog
		title="FTP 会话"
		:visible="visible"
		append-to-body
		width="70%"
		:show-close="false"
		:destroy-on-close="false"
		:close-on-click-modal="false"
		@close="handlerClose"
	>
		<el-form
			ref="telnetFormRef"
			:model="sessionForm"
			:rules="telnetFormRules"
			class="n-session-ssh-container"
			label-position="top"
			label-width="80px"
		>
			<div class="n-session-ssh-container__left">
				<el-form-item :label="t('home.profile.base.host-name.title')" prop="hostName">
					<el-input
						v-model="sessionForm.hostName"
						:placeholder="t('home.profile.base.host-name.placeholder')"
					/>
				</el-form-item>
				<el-form-item :label="t('home.profile.base.host-name.title')" prop="system">
					<n-space>
						<el-autocomplete
							v-model="sessionForm.system"
							value-key="icon"
							:fetch-suggestions="querySearch"
							clearable
							placeholder="请输入内容"
						/>
						<n-icon :name="sessionForm.system" size="24" />
					</n-space>
				</el-form-item>
				<el-form-item :label="t('home.profile.base.host-group.title')" prop="group">
					<el-select
						v-model="sessionForm.group"
						:placeholder="t('home.profile.base.host-group.placeholder')"
						style="width: 100%"
					>
						<el-option
							v-for="(item, index) in group"
							:label="item.label"
							:value="item.value"
							:key="index"
						/>
					</el-select>
				</el-form-item>
			</div>
			<div class="n-session-ssh-container__right">
				<el-tabs v-model="activeTab" type="border-card">
					<!-- 通用 -->
					<el-tab-pane :label="t('components.session.base.label')" name="base">
						<el-row :gutter="10">
							<el-col :span="6">
								<el-form-item :label="t('home.profile.auth.secure.title')">
									<el-select
										v-model="sessionForm.secure"
										:placeholder="t('home.profile.auth.secure.description')"
									>
										<el-option value="true" :label="t('home.profile.auth.secure.options.true')" />
										<el-option value="false" :label="t('home.profile.auth.secure.options.false')" />
										<el-option
											value="control"
											:label="t('home.profile.auth.secure.options.control')"
										/>
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<!-- 主机 -->
								<el-form-item :label="$t('home.profile.base.host.title')" prop="hostAddress">
									<el-input v-model="sessionForm.hostAddress" />
								</el-form-item>
							</el-col>
							<el-col :span="6">
								<!-- 端口 -->
								<el-form-item :label="$t('home.profile.base.port.title')" prop="hostFtpPort">
									<el-input-number v-model="sessionForm.hostFtpPort" :min="1" :max="65535" />
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="10">
							<el-col :span="12">
								<!-- 用户名 -->
								<el-form-item :label="$t('home.profile.auth.username.title')" prop="username">
									<el-input v-model="sessionForm.username" />
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<!-- 密码 -->
								<el-form-item :label="$t('home.profile.auth.password.title')" prop="password">
									<el-input v-model="sessionForm.password" />
								</el-form-item>
							</el-col>
						</el-row>
					</el-tab-pane>
				</el-tabs>
			</div>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button @click="visible = false">{{ t('components.Cancel') }}</el-button>
			<el-button type="primary" @click="handleOk">{{ t('components.OK') }}</el-button>
			<el-button type="primary" @click="handleSaveAndConnect">
				{{ t('home.profile.operator.save-conn') }}
			</el-button>
		</div>
	</el-dialog>
</template>
<script setup>
import { querySearch } from '@/icons/system-icon'
import { publish } from '@/services/eventbus'
import { SESSION_CONFIG_TYPE, SessionConfig } from '@/services/sessionMgr'
import { useSessionStore } from '@/store'
import { storeToRefs } from 'pinia'
import { getCurrentInstance, ref } from 'vue'
import { useI18n } from 'vue-i18n-bridge'
import { defaultForm } from './constants'

const { t } = useI18n()
const emits = defineEmits(['ok', 'cancel'])
const visible = ref(false)
const telnetFormRef = ref()
const sessionForm = ref({ ...defaultForm })
const telnetFormRules = {
	hostName: [{ required: true, message: '请输入会话名称', trigger: 'blur' }],
	hostAddress: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
	hostFtpPort: [{ required: true, message: '请输入主机端口', trigger: 'blur' }]
}
const sessionStore = useSessionStore()
const { group } = storeToRefs(sessionStore)
const activeTab = ref('base')
const isEdit = ref(false)
const proxy = getCurrentInstance().proxy
const sessionManager = proxy.$sessionManager
const sessionConfig = ref()

const showModal = (sessionId) => {
	if (sessionId) {
		isEdit.value = true
		sessionConfig.value = sessionManager.getSessionConfigById(sessionId)
		// 移除旧会话中无用属性
		const newFormKeys = Object.keys(sessionForm.value)
		const oldFormKeys = Object.keys(sessionConfig.value.config)
		// 删除oldFormKeys 中不在newFormKeys中的属性
		for (let i = 0, len = oldFormKeys.length; i < len; i++) {
			const key = oldFormKeys[i]
			if (!newFormKeys.includes(key)) {
				delete sessionConfig.value[key]
			}
		}
		sessionForm.value = { ...sessionForm.value, ...sessionConfig.value.config }
	}
	visible.value = true
}

const saveOrUpdateSession = () => {
	const sessionName = sessionForm.value.hostName
	if (isEdit.value) {
		// 更新配置信息
		sessionConfig.value.update(sessionName, Object.assign(sessionConfig.value.config, sessionForm.value), '')
	} else {
		// 创建会话配置
		sessionConfig.value = new SessionConfig(
			sessionName,
			SESSION_CONFIG_TYPE.NODE,
			sessionForm.value,
			'telnet session'
		)
		// 添加会话配置
		sessionStore.appendSessionConfig(sessionConfig.value)
	}
	// 刷新菜单
	publish('refresh-session-tree')
}

const handleOk = () => {
	telnetFormRef.value.validate((valid) => {
		if (!valid) {
			return false
		}
		saveOrUpdateSession()
		emits('ok', sessionForm.value)
		visible.value = false
	})
}

const handleSaveAndConnect = () => {
	telnetFormRef.value.validate((valid) => {
		if (!valid) {
			return false
		}
		saveOrUpdateSession()
		sessionManager.createSessionInstance(sessionConfig.value)
		emits('ok', sessionForm.value)
		visible.value = false
	})
}

const handlerClose = () => {
	isEdit.value = false
	activeTab.value = 'base'
	sessionConfig.value = undefined
	sessionForm.value = { ...defaultForm }
	telnetFormRef.value?.clearValidate()
}

defineExpose({ showModal })
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__body {
	height: 400px;
}

.n-session-ssh-container {
	display: flex;
	justify-content: space-between;
	column-gap: 10px;

	&__left {
		width: 30%;
		padding-top: 12px;
	}

	&__right {
		flex: 1;

		.n-port-forward {
			display: flex;
			column-gap: 5px;
			justify-content: space-between;
			width: 100%;

			&__source,
			&__target {
				flex: 1;
				display: inline-flex;
				column-gap: 5px;
			}
		}

		.n-theme-form {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-gap: 10px;
			padding-right: 10px;
			max-height: 340px;
			grid-template-areas: 'normal theme';

			.theme {
				grid-area: theme;
				grid-column: 2 / span 1;
				grid-row: 1 / span 5;
				max-height: 255px;
			}
		}
	}
}
</style>
