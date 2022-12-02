<template>
	<div
		class="nx-menu-wrapper"
		v-context-menu="sessionConfigsTreeContextMenu.empty"
		@contextmenu.stop="handleSessionTreeContainerClick"
		@click="handleSessionTreeContainerClick"
	>
		<!-- 提示创建会话配置 -->
		<el-scrollbar style="height: calc(100% - 32px)">
			<el-tree
				ref="sessionTree"
				node-key="id"
				icon-class="empty"
				draggable
				:highlight-current="highlightCurrent"
				:data="sessionConfigsTree"
				:default-expanded-keys="expandedKeys"
				:props="{ children: 'children', label: 'text' }"
				@node-contextmenu="nodeContextmenu"
				@node-drop="handleNodeDrop"
				@node-expand="handleNodeExpand"
				@node-collapse="handleNodeCollapse"
				@node-click="handleNodeSelected"
			>
				<template v-slot="{ node, data: { data, children } }">
					<span class="custom-tree-node" @dblclick.stop="handleHostOpen(data)">
						<n-space>
							<n-icon v-if="!children" type="img" v-bind:name="data | formatIconName" size="18" />
							<i v-else-if="node.expanded" class="el-icon-folder-opened" style="font-size: 18px" />
							<i v-else class="el-icon-folder" style="font-size: 18px" />
							<span :title="node.label || '-'">{{ node.label }}</span>
						</n-space>
						<el-tooltip
							v-if="data.type === 'node' && data.config.protocal === 'ssh'"
							effect="dark"
							:content="T('home.sessions-context-menu.sftp')"
							placement="top-start"
						>
							<span class="session-extend" @click.stop="handleOpenSFTP(data)">
								<i class="el-icon-folder-opened" />
							</span>
						</el-tooltip>
					</span>
				</template>
			</el-tree>
			<el-empty
				v-if="!isSearch && sessionConfigsTree.length === 0"
				:description="T('home.host-manager.session-tree.no-session-data')"
			/>
			<el-empty
				v-if="isSearch && sessionConfigsTree.length === 0"
				:description="T('home.host-manager.session-tree.no-search-result')"
			/>
		</el-scrollbar>
		<!--编辑文件夹-->
		<nx-folder-dialog ref="folderDialogRef" :edit="isEdit" @ok="handleOk" />
	</div>
</template>

<script>
import { treeIconFilter } from '@/views/sysicons'
import { SESSION_CONFIG_TYPE } from '@/services/sessionMgr'
import {
	addSessionConfig,
	handleOpenSFTP,
	handleSessionTreeContextMenu_Connect,
	handleSessionTreeContextMenu_ImportConfig,
	handleSessionTreeContextMenu_RenameFolder,
	handleSessionTreeContextMenu_SaveConfig,
	handleSessionTreeContextMenu_SFTP,
	processSessionConfigTree,
	treeOpClipboardCopy,
	treeOpClipboardCut
} from './tools'
import * as EventBus from '@/services/eventbus'
import { mapMutations, mapState } from 'vuex'
import { activeSession } from '@/layout/components/tabbar/tabs-utools'
import NxFolderDialog from './components/FolderDialog.vue'
import NSpace from '@/components/space'
import { showContextMenu } from '@/components/menu/contextmenu'

export default {
	name: 'NxMenus',
	components: { NSpace, NxFolderDialog },
	data() {
		return {
			sessionConfigsTree: [],
			isSearch: false,
			isEdit: false,
			showContentMenu: false,
			highlightCurrent: true,
			expandedKeys: [],
			sessionConfigsTreeContextMenu: {
				folder: [
					{
						label: 'home.sessions-context-menu.create-folder',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_CreateFolder
					},
					{
						label: 'home.sessions-context-menu.create-session',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_CreateSessionConfig
					},
					{
						label: 'home.sessions-context-menu.cut',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Cut
					},
					{
						label: 'home.sessions-context-menu.copy',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Copy
					},
					{
						label: 'home.sessions-context-menu.paste',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Paste
					},
					{
						label: 'home.sessions-context-menu.delete',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Delete
					},
					{
						label: 'home.sessions-context-menu.rename',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_RenameFolder
					}
				],
				node: [
					{
						label: 'home.sessions-context-menu.connect',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Connect
					},
					{
						label: 'home.sessions-context-menu.cut',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Cut
					},
					{
						label: 'home.sessions-context-menu.copy',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Copy
					},
					{
						label: 'home.sessions-context-menu.delete',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Delete
					},
					{
						label: 'home.sessions-context-menu.prop',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Prop
					}
				],
				empty: [
					{
						label: 'home.sessions-context-menu.create-folder',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_CreateFolder
					},
					{
						label: 'home.sessions-context-menu.create-session',
						type: 'normal',
						handler: this.gotoCreateShellSession
					},
					{
						label: 'home.sessions-context-menu.save-config',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_SaveConfig
					},
					{
						label: 'home.sessions-context-menu.import-config',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_ImportConfig
					}
				]
			},
			treeOpClipboard: {
				data: null,
				operate: ''
			}
		}
	},
	computed: {
		...mapState(['currentSelectedSessionNode'])
	},
	filters: {
		formatIconName: function (value) {
			if (!value) return 'linux'
			return treeIconFilter(value)['iconName']
		}
	},
	async mounted() {
		// 订阅主机搜索事件
		EventBus.subscript('nx-menu-search', (keywords) => {
			this.isSearch = !!keywords
			this.$refs.sessionTree.store.defaultExpandAll = !!keywords
			const sessionConfigs = this.$sessionManager.getSessionConfigs()
			this.sessionConfigsTree = this.processSessionConfigTree(sessionConfigs, keywords)
		})
		// 订阅新建文件夹事件
		EventBus.subscript('create-session-folder', () => {
			this.handleSessionTreeContextMenu_CreateFolder()
		})
		// 订阅菜单刷新事件
		EventBus.subscript('refresh-session-tree', () => {
			this.updateSessionTree()
		})
		// 订阅会话创建事件
		EventBus.subscript('create-session-toolbar', () => {
			this.gotoCreateShellSession()
		})
		this.$nextTick(() => {
			this.updateSessionTree()
			this.updateCurrentSelectedSessionNode({ data: null, node: null, treeNode: this.$refs.sessionTree })
		})
	},
	methods: {
		...mapMutations(['updateCurrentSelectedSessionNode']),
		activeSession,
		addSessionConfig,
		processSessionConfigTree,
		treeOpClipboardCut,
		treeOpClipboardCopy,
		handleSessionTreeContextMenu_Connect,
		handleOpenSFTP,
		handleSessionTreeContextMenu_SFTP,
		handleSessionTreeContextMenu_SaveConfig,
		handleSessionTreeContextMenu_ImportConfig,
		handleSessionTreeContextMenu_RenameFolder,
		async handleNodeDrop(source, parentNode, position) {
			const targetSession = this.$sessionManager.getSessionConfigById(parentNode.data.data._id)
			const sourceNode = this.$sessionManager.getSessionConfigById(source.data.data._id)
			sourceNode._parent.removeSubSessionConfig(sourceNode, true)
			if (position === 'inner') {
				targetSession.addSessionConfig(sourceNode)
			} else {
				const { index } = targetSession._parent.findSubSessionConfig(parentNode.data.data._id)
				const destIndex = index + (position === 'before' ? 0 : 1)
				targetSession._parent.addSessionConfig(sourceNode, destIndex)
			}
			await this.$sessionManager.saveSessionConfigs()
			this.updateSessionTree()
		},
		handleNodeExpand(data, node) {
			this.expandedKeys = [node.key]
		},
		handleNodeCollapse(data, node, vnode, element) {
			this.expandedKeys.splice(this.expandedKeys.findIndex(item => item === node.key), 1)
		},
		handleNodeSelected(data, node, vnode, element) {
			// 修复由于当前文件夹下子元素为0 导致tree无法触发原有打开关闭事件
			if (data.isFolder && data.children.length === 0) node.expanded = !node.expanded
			const {
				data: { data: sessionData }
			} = node
			const sessionNode = { data: data, node: node, treeNode: this.$refs.sessionTree }
			this.updateCurrentSelectedSessionNode(sessionNode)
			if (sessionData.type === SESSION_CONFIG_TYPE.FOLDER) {
				// 目录节点不启动会话实例
				return
			}
			// 尝试激活会话实例窗口
			const sessionInstance = this.$sessionManager.matchSessionInstanceByConfig(sessionData)
			if (!sessionInstance) {
				// 没有匹配到则创建新的实例
				return
			}

			this.$nextTick(() => {
				this.activeSession(sessionInstance[0])
			})
		},
		async handleHostOpen(sessionData) {
			if (sessionData.type === SESSION_CONFIG_TYPE.FOLDER) {
				// 目录节点不启动会话实例
				return
			}
			await this.$sessionManager.createSessionInstance(sessionData)
		},
		nodeContextmenu(event, data, node, vnode) {
			const sessionNode = { data: data, node: node, treeNode: this.$refs.sessionTree }
			this.updateCurrentSelectedSessionNode(sessionNode)
			const { type: nodeType } = data.data
			let menuContent = []
			if (nodeType === SESSION_CONFIG_TYPE.FOLDER) {
				menuContent = this.sessionConfigsTreeContextMenu.folder
			}

			if (nodeType === SESSION_CONFIG_TYPE.NODE) {
				// TODO: 获取SessionConfig的状态，过滤掉一些无用状态
				const contextMenu = [...this.sessionConfigsTreeContextMenu.node]
				const {
					config: { protocal }
				} = data.data
				if (protocal === 'ssh') {
					contextMenu.unshift({
						label: 'home.sessions-context-menu.sftp',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_SFTP
					})
				}
				menuContent = contextMenu
			}
			showContextMenu(menuContent, event)
		},
		// 删除会话或者会话目录
		handleSessionTreeContextMenu_Delete() {
			const { data, node } = this.currentSelectedSessionNode
			const { _id } = data.data
			const sessionConfig = this.$sessionManager.getSessionConfigById(_id)
			const message =
				sessionConfig.type === SESSION_CONFIG_TYPE.NODE
					? this.T('home.host-manager.dialog-delete-confirm.delete-node', sessionConfig.name)
					: this.T('home.host-manager.dialog-delete-confirm.delete-folder', sessionConfig.name)
			this.$confirm(message, this.T('home.host-manager.dialog-delete-confirm.title'), {
				type: 'warning'
			}).then(() => {
				this.$sessionManager.removeSessionConfig(sessionConfig)
				this.updateSessionTree()
				this.handleSessionTreeContainerClick()
			})
		},
		updateSessionTree() {
			const sessionConfigs = this.$sessionManager.getSessionConfigs()
			this.sessionConfigsTree = this.processSessionConfigTree(sessionConfigs)
		},
		treeOpClipboardPaste() {
			const { data } = this.treeOpClipboard
			try {
				return (data && this.treeOpClipboard) || null
			} catch (error) {
				console.error('剪切复制异常', error)
				return null
			} finally {
				// 当前只粘贴一次，避免不必要的麻烦
				this.treeOpClipboard = {
					data: null,
					operate: ''
				}
			}
		},
		// 剪切会话
		handleSessionTreeContextMenu_Cut() {
			this.treeOpClipboardCut(this.currentSelectedSessionNode)
		},
		// 复制会话
		handleSessionTreeContextMenu_Copy() {
			this.treeOpClipboardCopy(this.currentSelectedSessionNode)
		},
		// 粘贴会话
		handleSessionTreeContextMenu_Paste() {
			const pasteData = this.treeOpClipboardPaste()
			if (!pasteData) {
				return
			}
			// 追加新的节点
			const { data: { data: nodeData, node, treeNode }, operate } = pasteData
			const sourceSessionConfig = this.$sessionManager.getSessionConfigById(nodeData.id)
			if (sourceSessionConfig) {
				// 如果是剪切则移除旧节点数据
				if (operate === 'cut') {
					treeNode.remove(nodeData)
					sourceSessionConfig._parent.removeSubSessionConfig(sourceSessionConfig, true)
				}
				// 新增会话
				this.addSessionConfig(operate === 'cut' ? sourceSessionConfig : sourceSessionConfig.duplicate())
			} else {
				console.warn('srcSessionConfig is null')
			}
		},
		/**
		 * 树容器操作
		 */
		handleSessionTreeContainerClick() {
			this.highlightCurrent = false
			this.updateCurrentSelectedSessionNode({ data: null, node: null, treeNode: this.$refs.sessionTree })
		},
		// 查看编辑会话配置
		async handleSessionTreeContextMenu_Prop() {
			const { data } = this.currentSelectedSessionNode
			const sessCfg = this.$sessionManager.getSessionConfigById(data.data._id)
			await this.$sessionManager.createShellSettingSessionInstance(sessCfg)
		},
		handleOk(folderSessionConfig) {
			if (this.isEdit) {
				const { name } = folderSessionConfig
				const { data } = this.currentSelectedSessionNode
				const sessConfigData = data.data
				const sessionConfig = this.$sessionManager.getSessionConfigById(sessConfigData._id)
				sessionConfig.update(name)
			} else {
				this.addSessionConfig(folderSessionConfig)
			}
			this.updateSessionTree()
		},
		/**
		 * 显示创建
		 */
		async gotoCreateShellSession() {
			const sessionConfig = this.$sessionManager.createShellSessionConfig(
				this.T('home.profile.default-session-name')
			)
			this.addSessionConfig(sessionConfig)
			await this.$sessionManager.createShellSettingSessionInstance(sessionConfig)
		},
		handleSessionTreeContextMenu_CreateSessionConfig() {
			this.gotoCreateShellSession()
		},
		handleSessionTreeContextMenu_CreateFolder() {
			const folderDialog = this.$refs.folderDialogRef
			folderDialog.show('')
		}
	}
}
</script>

<style lang="scss" scoped>
.nx-menu-wrapper {
	position: relative;
	height: 100%;
	background-color: var(--n-bg-color-base);

	.el-empty {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		.el-empty__description {
			p {
				color: var(--n-text-color-base);
			}
		}
	}

	.pt-tree {
		.nx-menu-item {
			padding-top: 5px;
			padding-right: 3px;
			padding-left: 4px;

			.pt-tree-item {
				border-radius: 4px;
				color: var(--n-text-color-base);

				//&:hover {
				//	color: #fff;
				//}

				.session-extend {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					width: 24px;
					height: 24px;
					box-sizing: border-box;
					border-radius: 4px;

					&:hover {
						background-color: var(--n-hover-bg-color);
					}
				}
			}
		}
	}

	.n-content-menu {
		position: absolute;
		top: 0;
		left: 0;
		color: #ffffff;
		padding: 10px;
		border-radius: 4px;

		background-color: var(--n-color-modal);
	}
}

::v-deep .el-tree {
	color: var(--n-text-color-base);
	background-color: var(--n-bg-color-base);
	padding: 5px;

	&.el-tree--highlight-current {
		.el-tree-node.is-current > .el-tree-node__content {
			background-color: var(--n-hover-bg-color);
		}
	}

	.el-tree-node {
		&:focus,
		&:hover {
			> .el-tree-node__content {
				background-color: var(--n-hover-bg-color);

				.custom-tree-node {
					.session-extend {
						display: inline-flex;
						font-size: 18px;
					}
				}
			}
		}

		.custom-tree-node {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			height: 32px;

			.session-extend {
				display: none;
				align-items: center;
				justify-content: center;
				width: 24px;
				height: 24px;
				box-sizing: border-box;
				border-radius: 4px;

				&:hover {
					background-color: var(--n-hover-bg-color);
				}
			}
		}

		.el-tree-node__content {
			height: 32px;

			.el-tree-node__expand-icon {
				font-size: 18px;
			}
		}
	}

	//.is-expanded {
	//	.el-tree-node__content {
	//		.el-tree-node__expand-icon:before {
	//			content: "\e784" !important;
	//		}
	//
	//		.el-tree-node__expand-icon.expanded {
	//			transform: rotate(0deg) !important;
	//		}
	//	}
	//}
}
</style>
