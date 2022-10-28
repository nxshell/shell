<template>
	<div v-if="visible" v-bind="$attrs" class="nx-toolbar">
		<el-input
			v-model="searchKeywords"
			:placeholder="T('home.host-manager.search.placeholder')"
			class="nx-search-input"
			suffix-icon="el-icon-search" />
		<Space :size="5">
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
		</Space>
		<!--新建文件夹弹窗-->
		<el-dialog
			:title="T(sessionFolderEditDialog.title)"
			:label-width="80"
			:visible.sync="sessionFolderEditDialog.showDialog"
			width="400px">
			<el-form :model="sessionFolderEditDialog.data">
				<el-form-item :label="T('home.host-manager.dialog-edit-folder.folder-name')">
					<el-input v-model="sessionFolderEditDialog.data.folderName"></el-input>
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
import Space from '@/components/space/index.vue'

export default {
	name: 'NxToolbar',
	components: { Space },
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
		}
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
			let treeData = this.processSessionConfigTree([sessCfg])[0]
			const menuRef = this.$parent.$children[2].$children[0]
			const sessionTree = menuRef.$refs.sessionTree
			if (!this.currentSelectSessionNode) {
				sessionTree.appendNode({ treeData })
				this.$sessionManager.addSessionConfig(null, sessCfg)
				menuRef.updateSessionTree()
				return
			}
			let { data, node } = this.currentSelectSessionNode
			if (node.isFolder) {
				node.appendChild(treeData)
				this.$sessionManager.addSessionConfig(data.data, sessCfg)
				menuRef.updateSessionTree()
				return
			}
			// 需要判断节点是不是根目录下的节点
			node = node.getParentNode()
			if (!node) {
				sessionTree.appendNode({ treeData })
				this.$sessionManager.addSessionConfig(null, sessCfg)
			} else {
				let { data } = node.nodeData
				node.appendSibling(treeData)
				this.$sessionManager.addSessionConfig(data.data, sessCfg)
			}

			menuRef.updateSessionTree()
		},
		async gotoCreateShellSession() {
			const sessCfg = this.$sessionManager.createShellSessionConfig(this.T('home.profile.default-session-name'))
			this.addSessionConfig(sessCfg)
			await this.$sessionManager.createShellSettingSessionInstance(sessCfg)
		},
		handlerClick(){
			if (!this.sessionFolderEditDialog.isEdit) {
				const sessCfg = new SessionConfig(
					this.sessionFolderEditDialog.data.folderName,
					SESSION_CONFIG_TYPE.FOLDER
				)
				this.addSessionConfig(sessCfg)
			} else {
				const sessCfg = this.$sessionManager.getSessionConfigById(
					this.currentSelectSessionNode.node.nodeData.data.data._id
				)
				sessCfg.update(this.sessionFolderEditDialog.data.folderName)
				this.sessionFolderEditDialog.showDialog = false
			}
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
		display: inline-block;
		box-sizing: border-box;
		text-align: center;
		padding: 5px;
		width: 32px;
		height: 32px;
		line-height: 22px;
		color: var(--n-text-color-base);
		border-radius: 4px;
		background-color: var(--btnPrimaryBackgroundColor);

		&:hover {
			cursor: pointer;
			background-color: var(--btnPrimaryHoverBackgroundColor);
		}
	}
}
</style>