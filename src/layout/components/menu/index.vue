<template>
	<div
		class="nx-menu-wrapper"
		v-context-menu="sessionConfigsTreeContextMenu.empty"
		@click="handleSessionTreeContainerClick"
	>
		<!-- 提示创建会话配置 -->
		<el-scrollbar style="height: 100%">
			<pt-tree
				ref="sessionTree"
				dataKey="uuid"
				:treeData="sessionConfigsTree"
				:iconFilter="treeIconFilter"
				:draggable="!isSearch"
				:autoExpanded="true"
				v-context-menu="getSessionConfigTreeContextMenu"
				@tree-node-select="handleHostSelected"
				@tree-node-open="handleHostOpen"
				@move-node="handleTreeNodeMove"
				@contextmenu="handleSessionTreeContextMenu"
			>
				<template v-slot:additional="scope">
					<el-tooltip v-if="scope.data.type == 'node' && scope.data.config.protocal == 'ssh'" class="item" effect="dark" :content="T('home.sessions-context-menu.sftp')" placement="top-start">
						<span class="session-extend" @click.stop="handleOpenSFTP(scope.data)">
							<i class="el-icon-folder-opened" />
						</span>
					</el-tooltip>
				</template>
			</pt-tree>
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
	processSessionConfigTree,
	handleSessionTreeContextMenu_Connect,
	treeOpClipboardCut,
	treeOpClipboardCopy,
	addSessionConfig,
	handleOpenSFTP,
	handleSessionTreeContextMenu_SFTP,
	handleSessionTreeContextMenu_SaveConfig,
	handleSessionTreeContextMenu_ImportConfig,
	handleSessionTreeContextMenu_RenameFolder
} from './tools'
import Storage from '@/services/storage/index'
import * as EventBus from '@/services/eventbus'
import { mapState, mapMutations } from 'vuex'
import { activeSession } from '@/layout/components/tabbar/tabs-utools'
import NxFolderDialog from '../../../views/components/folderDialog'

export default {
	name: 'NxMenus',
	components: { NxFolderDialog },
	data() {
		return {
			sessionConfigsTree: [],
			isSearch: false,
			isEdit: false,
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
		...mapState(['currentSelectedSessionNode']),
		treeIconFilter() {
			return treeIconFilter
		}
	},
	created() {
		this.updateSessionTree()
	},
	async mounted() {
		// 订阅主机搜索事件
		EventBus.subscript('nx-menu-search', (keywords) => {
			this.isSearch = !!keywords
			const sessionConfigs = this.$sessionManager.getSessionConfigs()
			this.sessionConfigsTree = this.processSessionConfigTree(sessionConfigs, keywords)
		})
		// 订阅新建文件夹事件
		EventBus.subscript('create-session-folder', (menuData) => {
			this.$nextTick(() => {
				this.$refs.sessionTree.appendNode({ treeData: menuData })
				this.updateSessionTree()
			})
		})
		// 订阅菜单刷新事件
		EventBus.subscript('refresh-session-tree', () => {
			this.updateSessionTree()
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
		getSessionConfigTreeContextMenu() {
			if (this.currentSelectedSessionNodeConfigType === SESSION_CONFIG_TYPE.FOLDER) {
				return this.sessionConfigsTreeContextMenu.folder
			}

			if (this.currentSelectedSessionNodeConfigType === SESSION_CONFIG_TYPE.NODE) {
				// TODO: 获取SessionConfig的状态，过滤掉一些无用状态
				let contextMenu =  [ ...this.sessionConfigsTreeContextMenu.node ]
				if (this.currentSelectedSessionProtocal === "ssh") {
					contextMenu.unshift({
						label: 'home.sessions-context-menu.sftp',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_SFTP
					})
				}
				return contextMenu
			}
		},
		/**
		 * 处理主机被选中
		 * @param {Object} node 选中的节点
		 * @param {Object} node.data 选中的节点数据
		 * @param {Boolean} node.multi 是否是多选，如果是多选则不会创建会话的
		 */
		async handleHostSelected(node) {
			this.updateCurrentSelectedSessionNode(node)
			const { data, multi } = node
			// 多选的情况下，不创建会话
			if (multi) {
				return
			}
			/**
			 * @type {SessionConfig}
			 */
			const sessCfg = data.data
			if (sessCfg.type === SESSION_CONFIG_TYPE.FOLDER) {
				// 目录节点不启动会话实例
				return
			}
			// 尝试激活会话实例窗口
			const sessionInstance = this.$sessionManager.matchSessionInstanceByConfig(sessCfg)
			if (!sessionInstance) {
				// 没有匹配到则创建新的实例
				return
			}

			this.$nextTick(() => {
				this.activeSession(sessionInstance[0])
			})
		},
		async handleHostOpen(data) {
			const sessCfg = data.data.data
			if (sessCfg.type === SESSION_CONFIG_TYPE.FOLDER) {
				// 目录节点不启动会话实例
				return
			}
			await this.$sessionManager.createSessionInstance(sessCfg)
		},
		/**
		 * 处理会话树节点的移动（拖动）
		 * @param {Object} nodeInfo                 移动节点的信息
		 * @param {Object} nodeInfo.dest            移动到的目标节点
		 * @param {String} nodeInfo.destPosition    移动到目标节点的位置，
		 *                                          parent：目标节点是父节点(文件夹)，直接追加到子节点上
		 *                                          before: 目标节点是兄弟节点，在兄弟节点之前
		 *                                          after: 目标节点是兄弟节点，在兄弟节点之后
		 * @param {Object} nodeInfo.source          源节点
		 */
		async handleTreeNodeMove({ dest, destPosition, source }) {
			const destNode = this.$sessionManager.getSessionConfigById(dest._id)
			/** @type {SessionConfig} */
			const sourceNode = this.$sessionManager.getSessionConfigById(source._id)
			// sourceNode.remove()
			sourceNode._parent.removeSubSessionConfig(sourceNode, true)
			if (destPosition === 'parent') {
				destNode.addSessionConfig(sourceNode)
			} else {
				const { index } = destNode._parent.findSubSessionConfig(dest._id)
				const destIndex = index + (destPosition === 'before' ? 0 : 1)
				destNode._parent.addSessionConfig(sourceNode, destIndex)
			}
			await this.$sessionManager.saveSessionConfigs()
			// TODO: 提示保存成功
		},
		/**
		 * 树右键菜单处理
		 */
		handleSessionTreeContextMenu(node) {
			this.updateCurrentSelectedSessionNode(node)
			const { data } = node
			const sessCfg = data.data
			this.currentSelectedSessionNodeConfigType = sessCfg.type
			this.currentSelectedSessionProtocal = sessCfg.config.protocal
		},
		// 删除会话或者会话目录
		handleSessionTreeContextMenu_Delete() {
			const { data, node } = this.currentSelectedSessionNode
			const sessCfgData = data.data
			const sessCfg = this.$sessionManager.getSessionConfigById(sessCfgData._id)
			const message =
				sessCfg.type === SESSION_CONFIG_TYPE.NODE
					? this.T('home.host-manager.dialog-delete-confirm.delete-node', sessCfg.name)
					: this.T('home.host-manager.dialog-delete-confirm.delete-folder', sessCfg.name)
			this.$confirm(message, this.T('home.host-manager.dialog-delete-confirm.title'), {
				type: 'warning'
			}).then(() => {
				this.$sessionManager.removeSessionConfig(sessCfg)
				node.remove()
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
			const {
				data: {
					data: { data: nodeData }
				},
				operate
			} = pasteData
			if (operate === 'cut') {
				// 复制原有节点数据
				// TODO: 移除原有的节点
				this.handleTreeNodeMove({
					dest: this.currentSelectedSessionNode.node.nodeData.data.data,
					destPosition: 'after',
					source: nodeData
				})
				// return;
				pasteData.data.node.remove()
				if (this.currentSelectedSessionNode.node.isFolder) {
					this.currentSelectedSessionNode.node.appendChild(nodeData)
				} else {
					this.currentSelectedSessionNode.node.appendSibling(nodeData, 'after')
				}
			} else {
				const srcSessionConfig = this.$sessionManager.getSessionConfigById(nodeData._id)
				const newSessionConfig = srcSessionConfig.duplicate()
				this.addSessionConfig(newSessionConfig)
			}
		},
		/**
		 * 树容器操作
		 */
		handleSessionTreeContainerClick() {
			this.updateCurrentSelectedSessionNode(null)
			this.$refs.sessionTree?.clearSelection()
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

<style lang="scss">
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
}
</style>
