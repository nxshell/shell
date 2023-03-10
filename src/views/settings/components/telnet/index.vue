<template>
	<el-dialog
		title="Telnet 会话配置"
		width="40%"
		:visible.sync="visible"
		:destroy-on-close="true"
		:close-on-click-modal="false"
		@close="handlerClose"
	>
		<el-form ref="telnetFormRef" :form="sessionForm" :rules="telnetFormRules" label-position="right"
		         label-width="120px">
			<el-form-item :label="$t('home.profile.base.host-name.title')" prop="hostName">
				<el-input v-model="sessionForm.hostName" />
			</el-form-item>
			<!-- 操作系统 -->
			<el-form-item :label="$t(OsType.title)" prop="osType">
				<el-select v-model="sessionForm[OsType.name]" style="width: 100%">
					<el-option v-for="(o,i) in OsType.options" :label="$t(o.label)" :value="o.value" :key="i" />
				</el-select>
			</el-form-item>
			<!-- 主机 -->
			<el-form-item :label="$t('home.profile.base.host.title')" prop="host">
				<el-input v-model="sessionForm.host" />
			</el-form-item>
			<!-- 端口 -->
			<el-form-item :label="$t('home.profile.base.port.title')" prop="hostTelnetPort">
				<el-input v-model="sessionForm.hostTelnetPort" />
			</el-form-item>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button @click="visible = false">取 消</el-button>
			<el-button type="primary" @click="handlerSave">确 定</el-button>
		</div>
	</el-dialog>
</template>
<script>
import OsType from '../../constants/osType'

export default {
	name: 'NxTelnetDialog',
	data() {
		return {
			visible: false,
			sessionForm: {
				hostName: '',
				osType: 'auto',
				host: '',
				hostTelnetPort: 23
			},
			telnetFormRules: {
				hostName: [
					{ required: true, message: '请输入会话名称', trigger: 'blur' }
				],
				host: [
					{ required: true, message: '请输入主机地址', trigger: 'blur' }
				],
				hostTelnetPort: [
					{ required: true, message: '请输入主机端口', trigger: 'blur' }
				]
			},
			OsType
		}
	},
	methods: {
		show(sessionId) {
			this.$nextTick(() => {
				const currentSession = this.$sessionManager.getSessionInstanceById(sessionId)
				console.log('会话信息', sessionId, currentSession)
			})
			this.visible = true
		},
		handlerSave() {
			this.$refs.telnetFormRef.validate((valid) => {
				if (valid) {
					alert('submit!');
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		},
		handlerClose() {
			this.$refs.telnetFormRef.resetFields();
		}
	}

}
</script>