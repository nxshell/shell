<template>
	<!--新建/编辑文件夹弹窗-->
	<el-dialog
		:title="title"
		:label-width="80"
		:close-on-click-modal="false"
		:visible.sync="visible"
		:append-to-body="true"
		width="400px"
		@close="handlerClose"
	>
		<el-form ref="createFolderRef" :model="folderForm" :rules="createFolderRules" @submit.native.prevent>
			<el-form-item :label="$t('home.host-manager.dialog-edit-folder.folder-name')" prop="folderName">
				<el-input v-model="folderForm.folderName" @keyup.native.enter="handlerClick" />
			</el-form-item>
		</el-form>
		<span slot="footer" class="dialog-footer">
			<el-button @click="visible = false">{{ $t('components.Cancel') }}</el-button>
			<el-button type="primary" @click="handlerClick">{{ $t('components.OK') }}</el-button>
		</span>
	</el-dialog>
</template>

<script>
import { SESSION_CONFIG_TYPE, SessionConfig } from '@/services/sessionMgr'

export default {
	name: 'NxFolderDialog',
	props: {
		edit: {
			type: Boolean,
			default: () => false
		}
	},
	data() {
		return {
			visible: false,
			folderForm: {
				folderName: ''
			},
			createFolderRules: {
				folderName: [{ validator: this.validateFolderName, trigger: 'change' }]
			}
		}
	},
	computed: {
		title() {
			return this.edit ? this.$t('home.host-manager.dialog-edit-folder.edit-title') : this.$t('home.host-manager.dialog-edit-folder.add-title')
		}
	},
	methods: {
		validateFolderName(rule, value, callback) {
			if (!value) {
				callback(new Error(this.$t('home.fileview.createdir-dialog.placeholder')))
			} else if (/[\/:*?."？《》、，。'<>|]/.test(value)) {
				callback(new Error(this.$t('home.fileview.createdir-dialog.invalid-dir-name',['\\ / : * ? \" < > | '])))
			} else {
				callback()
			}
		},
		show(data) {
			this.visible = true
			if (data) {
				this.folderForm.folderName = data
			}
		},
		handlerClose() {
			this.$refs.createFolderRef.resetFields()
		},
		handlerClick() {
			this.$refs.createFolderRef.validate((valid) => {
				if (valid) {
					const sessionConfig = new SessionConfig(this.folderForm.folderName, SESSION_CONFIG_TYPE.FOLDER)
					this.$emit('ok', sessionConfig)
					this.visible = false
				} else {
					return false
				}
			})
		}
	}
}
</script>
