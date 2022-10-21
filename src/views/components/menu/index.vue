<template>
	<div class="nx-menu-wrapper">
		<!-- 提示创建会话配置 -->
		<pt-tree
			v-if="true"
			:treeData="sessionConfigsTree"
			:iconFilter="treeIconFilter"
			:draggable="true"
			:nodeStates.sync="sessionConfigsTreeStates"
			v-context-menu="getSessionConfigTreeContextMenu"
			ref="sessionTree"
			@tree-node-select="handleHostSelected"
			@tree-node-open="handleHostOpen"
			@move-node="handleTreeNodeMove"
			@contextmenu="handleSessionTreeContextMenu">
			<template v-slot:additional="scope">
				<el-tooltip class="item" effect="dark" content="点击打开SFTP" placement="top-start">
					<span class="session-extend" @click.stop="handleOpenSFTP(scope)">
						<i class="el-icon-position" />
					</span>
				</el-tooltip>
			</template>
		</pt-tree>
		<el-empty v-else-if="sessionConfigsTree.length===0"
		          :description="T('home.host-manager.session-tree.no-session-data') " />
		<el-empty v-else :description="T('home.host-manager.session-tree.no-search-result')" />
	</div>
</template>

<script>

import { treeIconFilter } from '@/views/sysicons'
import { SESSION_CONFIG_TYPE } from "@/services/sessionMgr";
import { processSessionConfigTree } from '@/views/components/menu/tools'
import Storage from '@/services/storage'
import * as EventBus from '@/services/eventbus'

export default {
	name: 'NxMenus',
	components: {},
	data() {
		return {
			sessionConfigsTree: [],
			sessionConfigsTreeStates: {},
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
						type: 'separator'
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
						type: 'separator'
					},
					{
						label: 'home.sessions-context-menu.delete',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Delete
					},
					{
						type: 'separator'
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
						label: 'home.sessions-context-menu.sftp',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_SFTP
					},
					{
						type: 'separator'
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
						type: 'separator'
					},
					{
						label: 'home.sessions-context-menu.delete',
						type: 'normal',
						handler: this.handleSessionTreeContextMenu_Delete
					},
					{
						type: 'separator'
					},
					{
						label: 'home.sessions-context-menu.create',
						type: 'submenu',
						submenu: [
							{
								label: 'home.sessions-context-menu.create-folder',
								type: 'normal',
								handler: this.handleSessionTreeContextMenu_CreateFolder
							},
							{
								label: 'home.sessions-context-menu.create-session',
								type: 'normal',
								handler: this.handleSessionTreeContextMenu_CreateSessionConfig
							}
						]
					},
					{
						type: 'separator'
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
						handler: this.handleSessionTreeContextMenu_CreateSessionConfig
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
		}
	},
	watch: {
		sessionConfigsTreeStates() {
			Storage.save('HOME-SESSIONTREE-STATE', this.sessionConfigsTreeStates)
		}
	},
	computed: {
		treeIconFilter() {
			return treeIconFilter
		}
	},
	created() {
		EventBus.subscript('nx-menu-search', (keywords) => {
			console.log(keywords)
		})
		this.updateSessionTree()
	},
	methods: {
		processSessionConfigTree,
		getSessionConfigTreeContextMenu() {
			if (this.currentSelectSessionNodeConfigType === SESSION_CONFIG_TYPE.FOLDER) {
				return this.sessionConfigsTreeContextMenu.folder
			}

			if (this.currentSelectSessionNodeConfigType === SESSION_CONFIG_TYPE.NODE) {
				// TODO: 获取SessionConfig的状态，过滤掉一些无用状态
				return this.sessionConfigsTreeContextMenu.node
			}
		},
		/**
		 * 匹配会话Tab页
		 * 实际上一个会话配置可能会创建多个会话实例出来
		 * 但是我们在界面上只能选择其中一个
		 *
		 * @param {SessionConfig} sessCfg 会话的配置
		 */
		matchSessionTab(sessCfg) {
			let matchedSession = this.$sessionManager.matchSessionInstanceByConfig(sessCfg)
			if (!matchedSession) {
				return null
			}
			return matchedSession[0]
		},
		/**
		 * 处理主机被选中
		 * @param {Object} node 选中的节点
		 * @param {Object} node.data 选中的节点数据
		 * @param {Boolean} node.multi 是否是多选，如果是多选则不会创建会话的
		 */
		async handleHostSelected(node) {
			this.currentSelectSessionNode = node
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
			let sessInst = this.matchSessionTab(sessCfg)
			if (!sessInst) {
				// 没有匹配到则创建新的实例
				// sessInst = await this.$sessionManager.createSessionInstance(sessCfg);
				return
			}
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
			this.currentSelectSessionNode = node
			const { data } = node
			const sessCfg = data.data

			this.currentSelectSessionNodeConfigType = sessCfg.type
		},
		async handleOpenSFTP(sessCfg) {
			await this.$sessionManager.createSFTPSessionInstance(sessCfg.data)
		},
		// 删除会话或者会话目录
		handleSessionTreeContextMenu_Delete() {
			const { data, node } = this.currentSelectSessionNode
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
			}).catch((err) => {
				// console.error(err)
			})
		},
		updateSessionTree() {
			const sessionConfigs = this.$sessionManager.getSessionConfigs()
			this.sessionConfigsTree = this.processSessionConfigTree(sessionConfigs)
		},

	}
}
</script>

<style lang="scss">
.nx-menu-wrapper {
	position: relative;
	height: 100%;
	background-color: var(--backgroundColor);

	.el-empty {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		.el-empty__description {
			p {
				color: var(--primaryTextColor);
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
				color: var(--primaryTextColor);

				&:hover {
					color: #fff;
				}

				.session-extend {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					width: 24px;
					height: 24px;
					box-sizing: border-box;
					border-radius: 4px;

					&:hover {
						background-color: var(--highlightItemColor);
					}
				}
			}
		}
	}
}
</style>