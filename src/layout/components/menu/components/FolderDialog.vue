<template>
	<!--新建/编辑文件夹弹窗-->
	<el-dialog
		:title="title"
		:label-width="80"
		:close-on-click-modal="false"
		:visible.sync="visible"
		:append-to-body="true"
		width="400px"
		@before-close="handlerBeforeClose"
	>
		<el-form ref="createFolderRef" :model="folderForm" @submit.native.prevent>
			<el-form-item :label="$t('home.host-manager.dialog-edit-folder.folder-name')" prop="name" :rules="[{ validator: validateFolderName, trigger: 'change' }]">
				<el-input v-model="folderForm.name" @keyup.native.enter="handlerClick" />
			</el-form-item>
		</el-form>
		<span slot="footer" class="dialog-footer">
			<el-button @click="visible = false">{{ $t('components.Cancel') }}</el-button>
			<el-button type="primary" @click="handlerClick">{{ $t('components.OK') }}</el-button>
		</span>
	</el-dialog>
</template>

<script setup>
import { useI18n } from "vue-i18n-bridge";
import { reactive, ref } from "vue";
import { SESSION_CONFIG_TYPE, SessionConfig } from '@/services/sessionMgr'

const visible = ref(false)
const createFolderRef = ref()
const { t } = useI18n()
const emits = defineEmits(['ok'])
const title = ref('')
const folderForm = reactive({
	name: ''
})
const validateFolderName = (rule, value, callback) => {
	if (!value) {
		callback(new Error(t('home.fileview.createdir-dialog.placeholder')))
	} else if (/[\/:*?."？《》、，。'<>|]/.test(value)) {
		callback(new Error(t('home.fileview.createdir-dialog.invalid-dir-name', ['\\ / : * ? \" < > | '])))
	} else {
		callback()
	}
}

const show = (name) => {
	title.value = t('home.host-manager.dialog-edit-folder.add-title')
	if (name) {
		folderForm.name = name
		title.value = t('home.host-manager.dialog-edit-folder.edit-title')
	}
	visible.value = true
}

const handlerBeforeClose = () => {
	createFolderRef.value?.resetFields()
}

const handlerClick = () => {
	createFolderRef.value?.validate((valid) => {
		if (valid) {
			const sessionConfig = new SessionConfig(folderForm.name, SESSION_CONFIG_TYPE.FOLDER)
			emits('ok', sessionConfig)
			visible.value = false
		} else {
			return false
		}
	})
}

defineExpose({ show })
</script>

<style lang="scss" setup>
.el-dialog__body {
	min-height: auto;
}
</style>