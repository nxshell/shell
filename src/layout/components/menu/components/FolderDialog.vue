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
import { getCurrentInstance, reactive, ref } from "vue";
import { SESSION_CONFIG_TYPE, SessionConfig } from '@/services/sessionMgr'
import { useSessionStore } from '@/store'

const visible = ref(false)
const createFolderRef = ref()
const { t } = useI18n()
const emits = defineEmits(['ok'])
const title = ref('')
const folderForm = reactive({
    name: ''
})
const sessionStore = useSessionStore()
const sessionId = ref()
const proxy = getCurrentInstance().proxy
const sessionManager = proxy.$sessionManager

const validateFolderName = (rule, value, callback) => {
    if (!value) {
        callback(new Error(t('home.fileview.createdir-dialog.placeholder')))
    } else if (/[\/:*?."？《》、，。'<>|]/.test(value)) {
        callback(new Error(t('home.fileview.createdir-dialog.invalid-dir-name', ['\\ / : * ? \" < > | '])))
    } else {
        callback()
    }
}

const show = ($sessionId) => {
    title.value = t('home.host-manager.dialog-edit-folder.add-title')
    if ($sessionId) {
        sessionId.value = $sessionId
        const sessionConfig = sessionManager.getSessionConfigById($sessionId)
        folderForm.name = sessionConfig.name
        title.value = t('home.host-manager.dialog-edit-folder.edit-title')
    }
    visible.value = true
}

const handlerBeforeClose = () => {
    sessionId.value = undefined
    createFolderRef.value?.resetFields()
}

const handlerClick = () => {
    createFolderRef.value?.validate((valid) => {
        if (valid) {
            if (!sessionId.value) {
                const sessionConfig = new SessionConfig(folderForm.name, SESSION_CONFIG_TYPE.FOLDER)
                sessionStore.appendSessionConfig(sessionConfig)
            } else {
                sessionManager.getSessionConfigById(sessionId.value).update(folderForm.name)
            }
            sessionStore.updateProcess()
            emits('ok')
            visible.value = false
        } else {
            return false
        }
    })
}

defineExpose({ show })
</script>
