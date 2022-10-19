<template>
	<div class="nx-menu-wrapper">
		<!-- 提示创建会话配置 -->
		<pt-tree
			:treeData="data"
			:iconFilter="treeIconFilter"
			:draggable="false"
			:autoExpanded="true"
			v-context-menu="getSessionConfigTreeContextMenu"
			ref="sessionTree"
			@tree-node-select="handleHostSelected"
			@tree-node-open="handleHostOpen"
			@move-node="handleTreeNodeMove"
			@contextmenu="handleSessionTreeContextMenu">
			<template v-slot:additional="scope">
				<span class="session-extend">
					<!-- 配置类型为node的时候才显示sftp选项 -->
					<pt-icon
						v-if="scope.data.type === 'node' && scope.data.config.protocal === 'ssh'"
						size="small"
						iconName="ftp"
						title="SFTP"
						@click.stop="handleOpenSFTP(scope)"></pt-icon>
				</span>
			</template>
		</pt-tree>
		<!--						<div-->
		<!--							class="host-tree-view"-->
		<!--							tabindex="0"-->
		<!--							@click="handleSessionTreeContainerClick"-->
		<!--							v-context-menu="sessionConfigsTreeContextMenu.empty">-->
		<!--							<pt-scroll-container :size="5">-->
		<!--								<pt-tree-->
		<!--									v-if="!searchSessionKeyword"-->
		<!--									:treeData="sessionConfigsTree"-->
		<!--									:iconFilter="treeIconFilter"-->
		<!--									:draggable="true"-->
		<!--									:nodeStates.sync="sessionConfigsTreeStates"-->
		<!--									dataKey="data.uuid"-->
		<!--									v-context-menu="getSessionConfigTreeContextMenu"-->
		<!--									ref="sessionTree"-->
		<!--									@tree-node-select="handleHostSelected"-->
		<!--									@tree-node-open="handleHostOpen"-->
		<!--									@move-node="handleTreeNodeMove"-->
		<!--									@contextmenu="handleSessionTreeContextMenu">-->
		<!--									<template v-slot:additional="scope">-->
		<!--										<span class="session-extend">-->
		<!--											&lt;!&ndash; 配置类型为node的时候才显示sftp选项 &ndash;&gt;-->
		<!--											<pt-icon-->
		<!--												v-if="scope.data.type == 'node' && scope.data.config.protocal == 'ssh'"-->
		<!--												size="small"-->
		<!--												iconName="ftp"-->
		<!--												title="SFTP"-->
		<!--												@click.stop="handleOpenSFTP(scope)"></pt-icon>-->
		<!--										</span>-->
		<!--									</template>-->
		<!--								</pt-tree>-->
		<!--								-->
		<!-- 提示无数据 -->
		<!--		<div v-if="!searchSessionKeyword && sessionConfigsTree.length === 0" class="no-session-data">-->
		<!--			{{ T('home.host-manager.session-tree.no-session-data') }}-->
		<!--		</div>-->
		<!--		&lt;!&ndash; 提示无搜索结果 &ndash;&gt;-->
		<!--		<div-->
		<!--			v-if="searchSessionKeyword && sessionConfigsSearchTree.nodes.length === 0"-->
		<!--			class="no-session-data">-->
		<!--			{{ T('home.host-manager.session-tree.no-search-result') }}-->
		<!--		</div>-->
		<!--		</pt-scroll-container>-->
		<!--	</div>-->
	</div>
</template>

<script>

import { treeIconFilter } from '@/views/sysicons'
import { SESSION_CONFIG_TYPE } from "@/services/sessionMgr";

export default {
	name: 'NxMenus',
	components: {},
	props: {
		data: {
			type: Array,
			required: true,
			default: () => []
		}
	},
	data() {
		return {
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
	computed: {
		treeIconFilter() {
			return treeIconFilter
		}
	},
	methods: {
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

			this.$nextTick(() => {
				this.activeSession(sessInst)
			})
		},
		async handleHostOpen(data) {
			const sessCfg = data.data.data
			if (sessCfg.type === SESSION_CONFIG_TYPE.FOLDER) {
				// 目录节点不启动会话实例
				return
			}

			const sessInst = await this.$sessionManager.createSessionInstance(sessCfg)
			this.$nextTick(() => {
				this.activeSession(sessInst)
			})
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
				const { sessionConfig, index } = destNode._parent.findSubSessionConfig(dest._id)
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
	}
}
</script>

<style lang="scss"></style>