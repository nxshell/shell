<template>
	<el-dialog
		:title="t(`${isEdit ? 'components.ssh.modal-title-edit' : 'components.ssh.modal-title-add'}`)"
		:visible="visible"
		append-to-body
		width="80%"
		:show-close="false"
		:destroy-on-close="false"
		:close-on-click-modal="false"
		@close="handleCancel"
		class="n-ssh-form"
	>
		<el-form ref="sshSubFormRef" :model="sshSubForm" :rules="rules" class="n-session-ssh-container" label-position="top" label-width="80px">
			<div class="n-session-ssh-container__left">
				<el-form-item :label="t('home.profile.base.host-name.title')" prop="hostName">
					<el-input v-model="sshSubForm.hostName" :placeholder="t('home.profile.base.host-name.placeholder')" />
				</el-form-item>
				<el-form-item :label="t('home.profile.base.host-name.title')" prop="system">
					<n-space>
						<el-autocomplete v-model="sshSubForm.system" value-key="icon" :fetch-suggestions="querySearch" clearable placeholder="请输入内容" />
						<n-icon :name="sshSubForm.system" size="24" />
					</n-space>
				</el-form-item>
				<el-form-item :label="t('home.profile.base.host-group.title')" prop="group">
					<el-select v-model="sshSubForm.group" :placeholder="t('home.profile.base.host-group.placeholder')" style="width: 100%">
						<el-option v-for="(item, index) in group" :label="item.label" :value="item.value" :key="index" />
					</el-select>
				</el-form-item>
			</div>
			<div class="n-session-ssh-container__right">
				<el-tabs v-model="activeTab" type="border-card">
					<!-- 通用 -->
					<el-tab-pane :label="t('components.session.base.label')" name="base">
						<el-row :gutter="5" style="margin-bottom: 18px">
							<el-col :xs="4" :sm="4" :md="4" :lg="6" :xl="4">
								<el-form-item :label="t('components.session.base.link-type.label')">
									<el-select v-model="sshSubForm.proxy" :placeholder="t('components.session.base.link-type.placeholder')">
										<el-option value="none" :label="t('components.session.base.link-type.options.directly')" />
										<el-option value="socksv5" :label="t('components.session.base.link-type.options.socks')" />
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="15">
								<el-form-item :label="t('home.profile.base.host.title')" prop="hostAddress">
									<el-input
										v-model="sshSubForm.hostAddress"
										:placeholder="t('home.profile.base.host.placeholder')"
										:rule="[{ required: true, message: '请输入主机地址' }]"
									/>
								</el-form-item>
							</el-col>
							<el-col :xs="8" :sm="8" :md="6" :lg="6" :xl="4">
								<el-form-item :label="t('home.profile.base.port.title')">
									<el-input-number
										size="small"
										v-model="sshSubForm.hostPort"
										controls-position="right"
										:placeholder="t('home.profile.base.port.placeholder')"
									/>
								</el-form-item>
							</el-col>
						</el-row>
						<!--Socks代理-->
						<el-row :gutter="5" v-if="sshSubForm.proxy === 'socksv5'">
							<el-col :xs="12" :sm="12" :md="12" :lg="18" :xl="19">
								<el-form-item :label="t('home.profile.auth.socksv5.host.title')">
									<el-input v-model="sshSubForm.proxyHost" placeholder="请输入代理主机地址" />
								</el-form-item>
							</el-col>
							<el-col :xs="8" :sm="8" :md="6" :lg="6" :xl="4">
								<el-form-item :label="t('home.profile.auth.socksv5.port.title')">
									<el-input-number size="small" v-model="sshSubForm.proxyPort" controls-position="right" placeholder="请输入代理主机端口" />
								</el-form-item>
							</el-col>
						</el-row>
						<el-radio-group v-model="sshSubForm.authType">
							<el-radio-button label="password">
								{{ t("home.profile.auth.auth-type.options.password") }}
							</el-radio-button>
							<el-radio-button label="cert">
								{{ t("home.profile.auth.auth-type.options.publickey") }}
							</el-radio-button>
							<el-radio-button label="keyboard-interactive">
								{{ t("home.profile.auth.auth-type.options.keyboard-interactive") }}
							</el-radio-button>
						</el-radio-group>
						<el-row :gutter="5">
							<el-col :span="12">
								<el-form-item :label="t('home.profile.auth.username.title')">
									<el-input v-model="sshSubForm.username" :placeholder="t('home.profile.auth.username.placeholder')" />
								</el-form-item>
								<el-form-item v-if="sshSubForm.authType === 'cert'" :label="t('home.profile.auth.passphrase.title')">
									<el-input v-model="sshSubForm.passphrase" :placeholder="t('home.profile.auth.passphrase.placeholder')" show-password />
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item v-if="sshSubForm.authType === 'password'" :label="t('home.profile.auth.password.title')">
									<el-input v-model="sshSubForm.password" :placeholder="t('home.profile.auth.password.placeholder')" show-password />
								</el-form-item>
								<el-form-item v-if="sshSubForm.authType === 'cert'" :label="t('home.profile.auth.publickey.title')">
									<pt-file v-model="sshSubForm.cert" :placeholder="t('home.profile.auth.publickey.placeholder')" />
								</el-form-item>
							</el-col>
						</el-row>
					</el-tab-pane>
					<!-- 端口转发 -->
					<el-tab-pane :label="t('components.session.port.label')" name="second">
						<el-form-item :label="t('home.profile.auth.forwardin.title')">
							<div class="n-port-forward template">
								<!-- 远程 -->
								<div class="forward-remote">
									<div class="host">
										<el-input v-model="portForwardForm.remoteHost" placeholder="127.0.0.1" />
									</div>
									<div class="port">
										<el-input-number v-model="portForwardForm.remotePort" :min="1" :max="65535" placeholder="10024" controls-position="right" />
									</div>
								</div>
								<!-- 箭头 -->
								<div class="forward-link">
									<i class="el-icon-right"></i>
								</div>
								<!-- 本地 -->
								<div class="forward-local">
									<div class="host">
										<el-input v-model="portForwardForm.localHost" placeholder="127.0.0.1" />
									</div>
									<div class="port">
										<el-input-number v-model="portForwardForm.localPort" :min="1" :max="65535" placeholder="10024" controls-position="right" />
									</div>
								</div>
								<!-- 操作 -->
								<div class="options">
									<el-button type="primary" @click="addForward">添加</el-button>
								</div>
							</div>
							<!-- 预览 -->
							<el-scrollbar style="height: 260px">
								<div class="n-port-forward" v-for="(item, index) in sshSubForm.forwardIn" :key="index">
									<!-- 本地 -->
									<div class="forward-local">
										<div class="host">
											{{ item.localHost }}
										</div>
										<div class="port">
											{{ item.localPort }}
										</div>
									</div>
									<!-- 箭头 -->
									<div class="forward-link">
										<i class="el-icon-right"></i>
									</div>
									<!-- 远程 -->
									<div class="forward-remote">
										<div class="host">
											{{ item.remoteHost }}
										</div>
										<div class="port">
											{{ item.remotePort }}
										</div>
									</div>
									<!-- 操作 -->
									<div class="options">
										<el-button type="text" icon="el-icon-delete" @click="removeForward(index)"></el-button>
									</div>
								</div>
							</el-scrollbar>
						</el-form-item>
					</el-tab-pane>
					<!-- 主题 -->
					<el-tab-pane :label="t('components.session.theme.label')" name="fourth">
						<div class="n-theme-form">
							<template v-for="item in configItems">
								<el-row :title="t(item.description)" class="item">
									<el-col :span="6">
										<label>{{ t(item.title) }}</label>
									</el-col>
									<el-col :offset="3" :span="14">
										<el-input v-model="sshSubForm[item.name]" v-if="['text', 'password'].includes(item.type)" :type="item.type" />
										<el-input-number
											v-model="sshSubForm[item.name]"
											v-if="item.type === 'number'"
											controls-position="right"
											:step="item.step"
											:min="1"
											style="width: 100%"
										/>
										<el-switch v-model="sshSubForm[item.name]" v-if="item.type === 'switch'" />
										<el-radio-group v-if="item.type === 'radio-group'" v-model="sshSubForm[item.name]">
											<el-radio-button v-for="(r, index) in item.options" :label="r.value" :key="index">
												{{ r.label }}
											</el-radio-button>
										</el-radio-group>
										<el-select v-model="sshSubForm[item.name]" v-if="item.type === 'select'" style="width: 100%">
											<el-option v-for="(opt, idx) in item.options" :key="idx" :label="t(opt.label)" :value="opt.value" />
										</el-select>
									</el-col>
								</el-row>
							</template>
							<div class="item theme">
								<xtermThemeList :value.sync="sshSubForm.xtermTheme" :theme-options="sshSubForm" />
							</div>
						</div>
					</el-tab-pane>
					<!-- 高级 -->
					<el-tab-pane :label="t('components.session.advanced.label')" name="third">
						<n-space vertical fill>
							<n-space fill align="space-between">
								<!--X11 转发-->
								<span>{{ t("home.profile.auth.forward-type.title") }}</span>
								<el-switch v-model="sshSubForm.forward" active-value="x11" inactive-value="none" />
							</n-space>
							<n-space fill align="space-between">
								<!--活动状态保持间隔-->
								<span>{{ t("home.profile.connect.keepalive.title") }}</span>
								<el-input-number v-model="sshSubForm.keepAliveInterval" controls-position="right" />
							</n-space>
							<n-space fill align="space-between">
								<span>{{ t("home.profile.connect.keepalive-count-max.title") }}</span>
								<el-input-number v-model="sshSubForm.keepAliveCountMax" controls-position="right" />
							</n-space>
							<n-space fill align="space-between">
								<span>{{ t("home.profile.connect.ready-timeout.title") }}</span>
								<el-input-number v-model="sshSubForm.readyTimeout" controls-position="right" />
							</n-space>
							<n-space fill align="space-between">
								<!--X11 转发-->
								<span>{{ t("home.profile.connect.sftp-dirt.title") }}</span>
								<el-input v-model="sshSubForm.sftpDirt" style="width: 200px" />
							</n-space>
						</n-space>
					</el-tab-pane>
				</el-tabs>
			</div>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button @click="handleCancel">{{ t("components.Cancel") }}</el-button>
			<el-button type="primary" @click="handleOk">{{ t("components.OK") }}</el-button>
			<el-button type="primary" @click="handleSaveAndConnect">
				{{ t("home.profile.operator.save-conn") }}
			</el-button>
		</div>
	</el-dialog>
</template>

<script>
export default {
	name: "SshModal"
}
</script>

<script setup>
import { querySearch } from "@/icons/system-icon"
import { publish } from "@/services/eventbus"
import { SESSION_CONFIG_TYPE, SessionConfig } from "@/services/sessionMgr"
import { useSessionStore } from "@/store"
import xtermThemeList from "@/views/session/components/xtermTheme/index.vue"
import { storeToRefs } from "pinia"
import { getCurrentInstance, ref } from "vue"
import { useI18n } from "vue-i18n-bridge"
import { initDefaultThemeOptions } from "../constants"

const { configItems, formItem } = initDefaultThemeOptions()
const { t } = useI18n()
const visible = ref(false)
const sshSubFormRef = ref()
const forwardDefault = {
	localHost: "127.0.0.1",
	localPort: 10024,
	remoteHost: "127.0.0.1",
	remotePort: 10024
}
const defaultForm = {
	sessType: "ssh",
	protocal: "ssh",
	proxy: "none",
	system: "ssh",
	hostName: "",
	group: "",
	hostAddress: "",
	hostPort: 22,
	authType: "password",
	username: "",
	password: "",
	cert: "",
	passphrase: "",
	proxyHost: "",
	proxyPort: 1080,
	forward: "none",
	sftpDirt: "/",
	keepAliveInterval: 60,
	keepAliveCountMax: 3,
	readyTimeout: 20000,
	xtermTheme: "Night_3024",
	forwardIn: [],
	...formItem
}
const sshSubForm = ref({ ...JSON.parse(JSON.stringify(defaultForm)) })
const portForwardForm = ref({ ...JSON.parse(JSON.stringify(forwardDefault)) })

const rules = {
	hostName: [{ required: true, message: t("home.profile.base.host-name.description"), trigger: "blur" }],
	hostAddress: [{ required: true, message: t("home.profile.base.host.description"), trigger: "blur" }]
}
const activeTab = ref("base")
const emits = defineEmits(["cancel", "ok"])
const sessionStore = useSessionStore()
const isEdit = ref(false)
const proxy = getCurrentInstance().proxy
const sessionManager = proxy.$sessionManager
const sessionConfig = ref()
const { group } = storeToRefs(sessionStore)
const showModal = (sessionId) => {
	if (!!sessionId) {
		isEdit.value = true
		sessionConfig.value = sessionManager.getSessionConfigById(sessionId)
		const { config } = sessionConfig.value
		// 旧会话端口转发兼容
		if (config.hasOwnProperty("forwardInRemoteHost") && !["127.0.0.1", "localhost"].includes(config.forwardInRemoteHost)) {
			const { forwardInRemoteHost, forwardInRemotePort, forwardInLocalHost, forwardInLocalPort } = config
			sessionConfig.value["config"]["forwardIn"] = [
				{
					localHost: forwardInLocalHost,
					localPort: forwardInLocalPort,
					remoteHost: forwardInRemoteHost,
					remotePort: forwardInRemotePort
				}
			]
		}
		// 移除旧会话中无用属性
		const newFormKeys = Object.keys(sshSubForm.value)
		const oldFormKeys = Object.keys(sessionConfig.value.config)
		// 删除oldFormKeys 中不在newFormKeys中的属性
		for (let i = 0, len = oldFormKeys.length; i < len; i++) {
			const key = oldFormKeys[i]
			if (!newFormKeys.includes(key)) {
				delete sessionConfig.value[key]
			}
		}
		sshSubForm.value = { ...sshSubForm.value, ...sessionConfig.value.config }
	}
	visible.value = true
}

/**
 * 新增一个端口转发
 */
const addForward = () => {
	sshSubForm.value.forwardIn.push({ ...portForwardForm.value })
	portForwardForm.value = { ...forwardDefault }
}

/**
 * 删除端口转发
 * @param index 需要删除的序号
 */
const removeForward = (index) => sshSubForm.value.forwardIn.splice(index, 1)

const handleCancel = () => {
	sshSubForm.value = JSON.parse(JSON.stringify(defaultForm))
	sshSubFormRef.value?.clearValidate()
	sessionConfig.value = undefined
	isEdit.value = false
	activeTab.value = "base"
	emits("cancel")
	visible.value = false
}

const saveOrUpdate = async () => {
	// 更新配置信息
	const sessionName = sshSubForm.value.hostName
	if (isEdit.value) {
		await sessionConfig.value.update(sessionName, Object.assign(sessionConfig.value.config, sshSubForm.value), "")
	} else {
		// 创建会话配置
		sessionConfig.value = new SessionConfig(sessionName, SESSION_CONFIG_TYPE.NODE, sshSubForm.value, "telnet session")
		// 添加会话配置
		await sessionStore.appendSessionConfig(sessionConfig.value)
	}
	// 刷新菜单
	publish("refresh-session-tree")
	emits("ok", sshSubForm.value)
}

/**
 * 保存
 */
const handleOk = () => {
	sshSubFormRef.value?.validate((valid) => {
		if (valid) {
			saveOrUpdate()
			visible.value = false
		} else {
			return false
		}
	})
}

/**
 * 保存并连接
 */
const handleSaveAndConnect = () => {
	sshSubFormRef.value?.validate(async (valid) => {
		if (valid) {
			await saveOrUpdate()
			await sessionManager.createSessionInstance(sessionConfig.value)
			visible.value = false
		} else {
			return false
		}
	})
}
defineExpose({
	showModal
})
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

		.template {
			margin-bottom: 10px;
		}

		.n-port-forward {
			width: 100%;
			display: grid;
			grid-template-columns: 40% 50px 40% 8%;
			grid-gap: 10px;

			.forward-local,
			.forward-remote {
				display: flex;
				justify-content: space-between;
				align-items: center;
				column-gap: 5px;

				.host,
				.port {
					display: flex;
					justify-content: flex-start;
					align-items: center;
				}
			}

			.forward-link {
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: content-box;
			}

			.options {
				display: flex;
				justify-content: center;
				align-items: center;
				color: #f00;
			}
		}

		.n-theme-form {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-gap: 10px;
			padding-right: 10px;
			max-height: 340px;
			grid-template-areas: "normal theme";

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
