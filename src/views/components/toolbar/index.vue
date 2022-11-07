<template>
	<div v-if="visible" v-bind="$attrs" class="nx-toolbar">
		<el-input
			v-model="searchKeywords"
			:placeholder="T('home.host-manager.search.placeholder')"
			class="nx-search-input"
			clearable
			suffix-icon="el-icon-search" />
		<n-space :size="5">
			<el-tooltip class="item" effect="dark" content="新建分组" placement="top-start">
				<span class="host-tree-btn" @click="createFolder">
					<i class="el-icon-folder-add" />
				</span>
			</el-tooltip>
			<el-tooltip class="item" effect="dark" content="新建会话" placement="top-start">
				<span class="host-tree-btn" @click="gotoCreateShellSession">
					<i class="el-icon-circle-plus-outline" />
				</span>
			</el-tooltip>
		</n-space>
		<!--新建文件夹弹窗-->
		<el-dialog
			:title="T(sessionFolderEditDialog.title)"
			:label-width="80"
			:close-on-click-modal="false"
			:visible.sync="sessionFolderEditDialog.showDialog"
			width="400px"
			@close="handlerClose">
			<el-form ref="createFolderRef" :model="sessionFolderEditDialog.data" :rules="createFolderRules"
			         @submit.native.prevent>
				<el-form-item :label="T('home.host-manager.dialog-edit-folder.folder-name')" prop="folderName">
					<el-input v-model="sessionFolderEditDialog.data.folderName" @keyup.enter="handlerClick" />
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="sessionFolderEditDialog.showDialog = false">取 消</el-button>
				<el-button type="primary" @click="handlerClick">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import * as EventBus from '@/services/eventbus'
import { SESSION_CONFIG_TYPE, SessionConfig } from '@/services/sessionMgr'
import { resetValues } from '../../../../common/utils'
import { mapState } from 'vuex'

export default {
	name: 'NxToolbar',
	props: {
		visible: false
	},
	data() {
		return {
			searchKeywords: '',
			/**
			 * 会话目录编辑框
			 */
			sessionFolderEditDialog: {
				showDialog: false,
				isEdit: false,
				title: '',
				editId: -1,
				data: {
					folderName: ''
				}
			},
			createFolderRules: {
				folderName: [
					{ validator: this.validateFolderName, trigger: 'change' }
				]
			}
		}
	},
	computed: {
		...mapState(['currentSelectedSessionNode'])
	},
	watch: {
		searchKeywords() {
			EventBus.publish('nx-menu-search', this.searchKeywords)
		}
	},
	created() {
		EventBus.subscript('create-session', () => {
			this.gotoCreateShellSession()
		})
	},
	methods: {
		validateFolderName(rule, value, callback) {
			if (!value) {
				callback(new Error(this.T('home.fileview.createdir-dialog.placeholder')));
			} else if (/[\/:*?."'<>|]/.test(value)) {
				callback(new Error(this.T('home.fileview.createdir-dialog.invalid-dir-name')));
			} else {
				callback();
			}
		},
		// 新建分组
		createFolder() {
			this.sessionFolderEditDialog.showDialog = true
			this.sessionFolderEditDialog.isEdit = false
			this.sessionFolderEditDialog.title = 'home.host-manager.dialog-edit-folder.add-title'
			resetValues(this.sessionFolderEditDialog.data)
		},
		/**
		 * 处理会话配置树
		 */
		processSessionConfigTree(sessionConfigs, searchKeywords) {
			const sessionConfigTree = sessionConfigs
			let matchFunc = (name) => true
			if (searchKeywords) {
				let reg = new RegExp(searchKeywords, 'i')
				matchFunc = (name) => reg.test(name)
			}

			const walkAndProcess = (parent, cfgNodes) => {
				for (const cfgNode of cfgNodes) {
					let treeNode = {
						text: cfgNode.name,
						data: cfgNode.toJSONObject(false)
					}
					let children = []
					if (cfgNode.type === SESSION_CONFIG_TYPE.FOLDER) {
						walkAndProcess(children, cfgNode.subSessions)
						treeNode.children = children
					}
					if (matchFunc(cfgNode.name) || children.length > 0) {
						parent.push(treeNode)
					}
				}
			}
			let treeRoot = []
			walkAndProcess(treeRoot, sessionConfigTree)
			return treeRoot
		},
		/**
		 * 添加配置
		 * @param {SessionConfig} sessCfg 会话配置
		 */
		addSessionConfig(sessCfg) {
			const treeData = this.processSessionConfigTree([sessCfg])[0]
			if (!this.currentSelectedSessionNode) {
				this.$sessionManager.addSessionConfig(null, sessCfg)
				EventBus.publish('create-session-folder', treeData)
				this.sessionFolderEditDialog.showDialog = false
				return
			}
			let { data, node } = this.currentSelectedSessionNode
			if (node.isFolder) {
				node.appendChild(treeData)
				this.$sessionManager.addSessionConfig(data.data, sessCfg)
				EventBus.publish('refresh-session-tree', {})
				this.sessionFolderEditDialog.showDialog = false
				return
			}
			// 需要判断节点是不是根目录下的节点
			node = node.getParentNode()
			if (!node) {
				EventBus.publish('create-session-folder', treeData)
				this.$sessionManager.addSessionConfig(null, sessCfg)
			} else {
				const { data } = node.nodeData
				node.appendSibling(treeData)
				this.$sessionManager.addSessionConfig(data.data, sessCfg)
			}
			EventBus.publish('refresh-session-tree', {})
			this.sessionFolderEditDialog.showDialog = false
		},
		async gotoCreateShellSession() {
			const sessCfg = this.$sessionManager.createShellSessionConfig(this.T('home.profile.default-session-name'))
			this.addSessionConfig(sessCfg)
			await this.$sessionManager.createShellSettingSessionInstance(sessCfg)
		},
		handlerClick() {
			this.$refs.createFolderRef.validate((valid) => {
				if (valid) {
					const sessCfg = new SessionConfig(
						this.sessionFolderEditDialog.data.folderName,
						SESSION_CONFIG_TYPE.FOLDER
					)
					this.addSessionConfig(sessCfg)
				} else {
					return false;
				}
			});
		},
		handlerClose() {
			this.$refs.createFolderRef.resetFields()
		}
	}
}
</script>

<style lang="scss" scoped>
.nx-toolbar {
	display: flex;
	flex-wrap: nowrap;
	justify-content: space-between;
	align-items: center;
	padding: 0 5px;
	-webkit-app-region: no-drag;

	.nx-search-input {
		width: 213px;
		margin-right: 5px;
		transition: background-color .3s var(--n-bezier);
	}

	.host-tree-btn {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: 5px;
		width: 32px;
		height: 32px;
		line-height: 22px;
		border-radius: 2px;
		color: var(--n-button-primary-text);
		background-color: var(--n-button-primary);

		i {
			font-size: 16px;
		}

		&:hover {
			cursor: pointer;
			background-color: var(--n-button-primary-hover);
		}
	}
}
</style>