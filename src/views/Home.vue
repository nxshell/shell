<template>
	<div class="home">
		<pt-split-view ref="myview" :subViews="mainViews" type="vertical" :min-size="290">
			<pt-view :viewId="0">
				<div class="host-tree-toolbar">
					<el-input
						v-model="searchSessionKeyword"
						:placeholder="T('home.host-manager.search.placeholder')"
						suffix-icon="el-icon-search" />
					<Space :size="5">
						<el-tooltip class="item" effect="dark" content="新建分组" placement="top-start">
							<span class="host-tree-btn" @click="showAddFolderDialog">
								<i class="el-icon-folder-add" />
							</span>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" content="新建会话" placement="top-start">
							<span class="host-tree-btn" @click="gotoCreateShellSession">
								<i class="el-icon-circle-plus-outline" />
							</span>
						</el-tooltip>
					</Space>
				</div>
				<!--左侧菜单-->
				<div class="host-tree-view">
					<div
						class="host-tree-view"
						tabindex="0"
						@click="handleSessionTreeContainerClick"
						v-context-menu="sessionConfigsTreeContextMenu.empty">
						<pt-scroll-container :size="5">
							<pt-tree
								v-if="!searchSessionKeyword"
								:treeData="sessionConfigsTree"
								:iconFilter="treeIconFilter"
								:draggable="true"
								:nodeStates.sync="sessionConfigsTreeStates"
								dataKey="data.uuid"
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
										v-if="scope.data.type == 'node' && scope.data.config.protocal == 'ssh'"
										size="small"
										iconName="ftp"
										title="SFTP"
										@click.stop="handleOpenSFTP(scope)"></pt-icon>
								</span>
								</template>
							</pt-tree>
							<!-- 提示创建会话配置 -->
							<pt-tree
								v-else
								:treeData="sessionConfigsSearchTree.nodes"
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
										v-if="scope.data.type == 'node' && scope.data.config.protocal == 'ssh'"
										size="small"
										iconName="ftp"
										title="SFTP"
										@click.stop="handleOpenSFTP(scope)"></pt-icon>
								</span>
								</template>
							</pt-tree>
							<!-- 提示无数据 -->
							<div v-if="!searchSessionKeyword && sessionConfigsTree.length === 0"
							     class="no-session-data">
								{{ T('home.host-manager.session-tree.no-session-data') }}
							</div>
							<!-- 提示无搜索结果 -->
							<div
								v-if="searchSessionKeyword && sessionConfigsSearchTree.nodes.length === 0"
								class="no-session-data">
								{{ T('home.host-manager.session-tree.no-search-result') }}
							</div>
						</pt-scroll-container>
					</div>
				</div>
			</pt-view>
			<!-- 主内容区域 -->
			<pt-view :viewId="1">
				<pt-tab
					v-if="sessionInstTabs.length > 0"
					:tabs="sessionInstTabs"
					:activeIndex="currentSessionTabIdx"
					:translate="true"
					@activate="handleSessionInstActive"
					@remove="handleSessionInstRemove"
					@contextmenu="handleSessionTabsContextMenu"
					v-context-menu="getTabContextMenu"></pt-tab>
				<div class="sessions-container">
					<keep-alive>
						<router-view :key="$route.name" />
					</keep-alive>
				</div>
			</pt-view>
		</pt-split-view>
		<!--文件夹编辑弹窗-->
		<el-dialog
			:title="T(sessionFolderEditDialog.title)"
			:label-width="80"
			:visible.sync="sessionFolderEditDialog.showDialog"
			width="40%">
			<el-form :model="sessionFolderEditDialog.data">
				<el-form-item :label="T('home.host-manager.dialog-edit-folder.folder-name')">
					<el-input v-model="sessionFolderEditDialog.data.folderName"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="sessionFolderEditDialog.showDialog = false">取 消</el-button>
				<el-button type="primary" @click="handleEditFolderOk">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import { resetValues } from '../../common/utils'
import { SESSION_CONFIG_TYPE, SessionConfig } from '../services/sessionMgr'
import Storage from '../services/storage'

import * as EventBus from '../services/eventbus'

import PtScrollContainer from '../components/base/scrollcontainer'
import PtPopper from '../components/base/popper'
// import PtXtermSession from './xterm/xtermSession'

import { getSystemIcon, getSessionIcon, treeIconFilter } from './sysicons'
import { getFolderIcon } from './fileicons'

import mousetrap from 'mousetrap'
import Space from '@/components/space'

export default {
	name: 'Home',
	components: {
		Space,
		PtPopper,
		// PtXtermSession,
		PtScrollContainer
	},
	data() {
		return {
			props: {
				label: 'text',
				children: 'children'
			},
			/**
			 * 主视图
			 */
			mainViews: [
				{
					size: { value: 290, type: 'px', min: 0 }
				},
				{
					size: { value: 100, type: '%', min: 100 }
				}
			],

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

			/**
			 * 会话配置树
			 */
			searchSessionKeyword: '',
			sessionConfigsTree: [],
			sessionConfigsTreeStates: {},
			sessionConfigsSearchTree: {
				nodes: [],
				/**
				 * 解释一下为什么会有所谓的GC
				 * 我们将配置节点挂载树控件之后，为了响应配置节点的更新，我们需要响应配置节点的更新事件
				 * 所以每次在生成新的搜索结果树的时候，都会做响应事件的绑定
				 * 这就带来了一个问题，我们会反复的不停的向配置对象加节点更新事件的监听，却没有办法将不用的移除掉
				 * 所以我们需要知道搜索树是否被更新了，一旦我们知道更新了，我们就将以前绑定的更新事件清除掉
				 */
				eventGCNew: {},
				eventGCOld: {}
			},
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
			currentSelectSessionNodeConfigType: '',
			/**
			 * 当前选中的会话配置节点
			 */
			currentSelectSessionNode: null,
			/**
			 * 当前会话实例
			 */
			currentSessionInstance: null,

			/** 会话实例Tab列表 */
			sessionInstTabs: [],
			currentSessionTabIdx: 0,
			sessionTabContextMenu: {
				shell: [
					{
						label: 'home.sessions-context-menu.duplicate',
						type: 'normal',
						// accelerator: "ctrl+insert",
						handler: this.handleCopy
					},
					{
						label: 'home.sessions-context-menu.close',
						type: 'normal',
						// accelerator: "ctrl+insert",
						handler: this.handleClose
					},
					{
						label: 'home.sessions-context-menu.close-right',
						type: 'normal',
						handler: this.handleCloseRight
					},
					{
						label: 'home.sessions-context-menu.close-other',
						type: 'normal',
						handler: this.handleCloseOther
					},
					{
						label: 'home.sessions-context-menu.close-left',
						type: 'normal',
						handler: this.handleCloseLeft
					},
					{
						type: 'separator'
					},
					{
						label: 'home.sessions-context-menu.prop',
						type: 'normal',
						handler: this.handleProp
					}
				],
				welcome: [
					{
						label: 'home.sessions-context-menu.close',
						type: 'normal',
						handler: this.handleClose
					}
				],
				setting: [
					{
						label: 'home.sessions-context-menu.close',
						type: 'normal',
						handler: this.handleClose
					}
				],
				login: [
					{
						label: 'home.sessions-context-menu.close',
						type: 'normal',
						handler: this.handleClose
					}
				],
				unknow: [
					{
						label: 'home.sessions-context-menu.close',
						type: 'normal',
						handler: this.handleClose
					},
					{
						label: 'home.sessions-context-menu.close-left',
						type: 'normal',
						handler: this.handleCloseLeft
					},
					{
						label: 'home.sessions-context-menu.close-right',
						type: 'normal',
						handler: this.handleCloseRight
					},
					{
						label: 'home.sessions-context-menu.close-other',
						type: 'normal',
						handler: this.handleCloseOther
					}
				]
			},
			sessionContextMenuTabType: 'shell',
			sessionContextMenuTabIndex: -1,
			getTabContextMenu: () => {
				return this.getSessionTabContextMenu()
			},
			treeOpClipboard: {
				data: null,
				operate: ''
			}
		}
	},

	computed: {
		treeIconFilter() {
			return treeIconFilter
		}
	},

	watch: {
		searchSessionKeyword(newVal) {
			if (newVal) {
				const sessionConfigs = this.$sessionManager.getSessionConfigs()
				this.sessionConfigsSearchTree.nodes = this.processSessionConfigTree(sessionConfigs, newVal)
			}
		},

		/** 检测搜索树的更新，移除旧节点的update事件 */
		'sessionConfigsSearchTree.nodes'(newVal, oldVal) {
			Object.keys(this.sessionConfigsSearchTree.eventGCOld).forEach((cfgId) => {
				const node = this.$sessionManager.getSessionConfigById(parseInt(cfgId))
				node.off('update', this.sessionConfigsSearchTree.eventGCOld[cfgId])
			})
		},

		sessionConfigsTreeStates() {
			Storage.save('HOME-SESSIONTREE-STATE', this.sessionConfigsTreeStates)
		}
	},

	created() {
		this.init()
	},

	mounted() {
	},

	methods: {
		setupBarShortCut() {
			mousetrap.bind('alt+1', (e) => {
				this.activeSessionByIndex(0)
			})
			mousetrap.bind('alt+2', (e) => {
				this.activeSessionByIndex(1)
			})
			mousetrap.bind('alt+3', (e) => {
				this.activeSessionByIndex(2)
			})
			mousetrap.bind('alt+4', (e) => {
				this.activeSessionByIndex(3)
			})
			mousetrap.bind('alt+5', (e) => {
				this.activeSessionByIndex(4)
			})
			mousetrap.bind('alt+6', (e) => {
				this.activeSessionByIndex(5)
			})
			mousetrap.bind('alt+7', (e) => {
				this.activeSessionByIndex(6)
			})
			mousetrap.bind('alt+8', (e) => {
				this.activeSessionByIndex(7)
			})
			mousetrap.bind('alt+9', (e) => {
				this.activeSessionByIndex(8)
			})
		},
		activeSessionByIndex(index) {
			this.handleSessionInstActive(index)
		},
		async init() {
			this.sessionConfigsTreeStates = await Storage.read('HOME-SESSIONTREE-STATE')
			this.updateSessionTree()

			// this.$sessionManager.on("instance-create", (sessInst) => {
			//     this.updateSessionInstTabs();
			//     this.$nextTick(() => {
			//         this.activeSession(sessInst);
			//     })
			// });
			EventBus.subscript('instance-created', (sessInst) => {
				this.updateSessionInstTabs()
				this.$nextTick(() => {
					this.activeSession(sessInst)
				})
			})

			// this.$sessionManager.on("instance-destroy", () => {
			//     console.log("INSTANCE destroy");
			//     this.updateSessionInstTabs();
			// });
			EventBus.subscript('instance-destroyed', () => {
				this.updateSessionInstTabs()
			})

			EventBus.subscript('instance-close', (inst) => {
			})

			EventBus.subscript('session-update', (sessCfg) => {
				// TODO: 更新实例的名称
				// TODO: 更新会话配置树的名称
				this.handleSessionConfigUpdate(sessCfg)
			})

			// this.$sessionManager.on("create-session", () => {
			//     this.gotoCreateShellSession();
			// });
			EventBus.subscript('create-session', () => {
				this.gotoCreateShellSession()
			})

			EventBus.subscript('create-session-folder', () => {
				this.showAddFolderDialog()
			})

			EventBus.subscript('session-config-pannel', (action) => {
				if (action === 'open') {
					this.$set(this.mainViews, 0, {
						size: { value: 215, type: 'px', min: 215 }
					})
				} else {
					this.$set(this.mainViews, 0, {
						size: { value: 0, type: 'px', min: 0 }
					})
				}
				this.$refs['myview'].resize()
			})

			// this.$sessionManager.on("create-session-folder", () => {
			//     this.showAddFolderDialog();
			// });

			await this.$sessionManager.createWelcomeSessionInstance()
			this.setupBarShortCut()
		},

		async updateSessionInstTabs() {
			const instList = this.$sessionManager.getSessionIntances()
			this.sessionInstTabs = instList.map((inst) => {
				const item = {
					icon: 'setting',
					title: inst.name,
					data: inst
				}

				if (inst.type === 'shell') {
					item.icon = {
						iconName: getSystemIcon(inst.cfg.osType),
						type: 'img'
					}
					if (inst.name === '') {
						item.title = inst.cfg.hostAddress
					}
				} else if (inst.type === 'welcome') {
					item.icon = {
						iconName: getSessionIcon(inst.type),
						type: 'img'
					}
				} else if (inst.type === 'login') {
					item.icon = 'user'
				} else if (inst.type === 'sftp') {
					item.icon = {
						iconName: getFolderIcon(''),
						type: 'img'
					}
					if (inst.name === '') {
						item.title = inst.cfg.hostAddress
					}
				} else if (inst.type === 'vnc') {
					item.icon = {
						iconName: getSessionIcon(inst.type),
						type: 'img'
					}
				}
				// FIXME: 此处有隐患，实例移除时需要移除掉监听
				// inst.on("update-name", () => {
				//     item.title = inst.name;
				// });
				return item
			})
			if (this.sessionInstTabs.length <= 0) {
				await this.$sessionManager.createWelcomeSessionInstance()
			} else {
				if (this.currentSessionTabIdx >= this.sessionInstTabs.length) {
					this.currentSessionTabIdx = this.sessionInstTabs.length - 1
				}
				this.handleSessionInstActive(this.currentSessionTabIdx || 0)
			}
		},

		/**
		 * 处理会话配置更新
		 * 需要更新配置树上的节点信息
		 *
		 * @param {import("../services/sessionMgr").SessionConfig} sessionConfig 会话配置
		 */
		handleSessionConfigUpdate(sessionConfig) {
			// 更新会话配置树上的信息
			const walkAndUpdate = (nodes) => {
				for (let node of nodes) {
					if (node.data._id === sessionConfig._id) {
						node.text = sessionConfig.name
						node.data = sessionConfig.toJSONObject(true)
						break
					}
					if (node.children && node.children.length > 0) {
						walkAndUpdate(node.children)
					}
				}
			}

			walkAndUpdate(this.sessionConfigsTree)
			walkAndUpdate(this.sessionConfigsSearchTree.nodes)

			// 更新实例信息
			/** @type {import("../services/session").SessionInterface[]} */
			let matchedSessionInstances = this.$sessionManager.matchSessionInstanceByConfig(sessionConfig)
			matchedSessionInstances &&
			matchedSessionInstances.forEach((inst) => {
				inst.updateName(sessionConfig.name)
			})
			if (matchedSessionInstances?.length) {
				this.updateSessionInstTabs()
			}
		},

		/**
		 * 处理会话配置树
		 */
		processSessionConfigTree(sessionConfigs, searchKeywords) {
			// let sessionConfigTree = sessionConfigs.map(sessionConfig => sessionConfig.toJSONObject(true))
			const sessionConfigTree = sessionConfigs
			let matchFunc = (name) => true
			let addToGC = (id, func) => {
			}
			if (searchKeywords) {
				let reg = new RegExp(searchKeywords, 'i')
				matchFunc = (name) => reg.test(name)

				// this.sessionConfigsSearchTree.eventGCOld = this.sessionConfigsSearchTree.eventGCNew;
				// this.sessionConfigsSearchTree.eventGCNew = {};
				// addToGC = (id, func) => {
				//     this.sessionConfigsSearchTree.eventGCNew[id] = func;
				// }
			}

			const walkAndProcess = (parent, cfgNodes) => {
				for (const cfgNode of cfgNodes) {
					let treeNode = {
						text: cfgNode.name,
						data: cfgNode.toJSONObject(false)
					}

					// const updateHandler = () => {
					//     const newCfgValue = cfgNode.toJSONObject(true);
					//     treeNode.text = newCfgValue.name;
					//     treeNode.data = newCfgValue;
					// }
					// cfgNode.on("update", updateHandler);
					// addToGC(cfgNode._id, updateHandler);
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
			const sessionTree = this.$refs.sessionTree

			if (!this.currentSelectSessionNode) {
				sessionTree.appendNode({ treeData })
				this.$sessionManager.addSessionConfig(null, sessCfg)
				this.updateSessionTree()
				return
			}
			let { data, node } = this.currentSelectSessionNode
			if (node.isFolder) {
				node.appendChild(treeData)
				this.$sessionManager.addSessionConfig(data.data, sessCfg)
				this.updateSessionTree()
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

			this.updateSessionTree()
		},

		updateSessionTree() {
			const sessionConfigs = this.$sessionManager.getSessionConfigs()
			this.sessionConfigsTree = this.processSessionConfigTree(sessionConfigs)
			console.log('菜单数据', this.sessionConfigsTree)
		},

		showAddFolderDialog() {
			this.sessionFolderEditDialog.showDialog = true
			this.sessionFolderEditDialog.isEdit = false
			this.sessionFolderEditDialog.title = 'home.host-manager.dialog-edit-folder.add-title'
			resetValues(this.sessionFolderEditDialog.data)
		},

		showEditFolderDialog() {
			this.sessionFolderEditDialog.showDialog = true
			this.sessionFolderEditDialog.isEdit = true
			this.sessionFolderEditDialog.title = 'home.host-manager.dialog-edit-folder.edit-title'
		},

		handleEditFolderOk() {
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
		},

		/**
		 * 显示创建
		 */
		async gotoCreateShellSession() {
			const sessCfg = this.$sessionManager.createShellSessionConfig(this.T('home.profile.default-session-name'))
			this.addSessionConfig(sessCfg)
			await this.$sessionManager.createShellSettingSessionInstance(sessCfg)
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
				const destIndex = index + (destPosition == 'before' ? 0 : 1)
				destNode._parent.addSessionConfig(sourceNode, destIndex)
			}
			await this.$sessionManager.saveSessionConfigs()
			// TODO: 提示保存成功
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
		 * 激活会话Tab
		 */
		activeSession(sessInst) {
			if (!sessInst) {
				return
			}
			let router = sessInst.router
			if (router.path === this.$route.path) {
				return
			}
			this.$router.push(router)
			this.currentSessionTabIdx = this.sessionInstTabs.findIndex((inst) => {
				return inst.data.id == sessInst.id
			})
		},

		/**
		 * 处理Session会话实例激活
		 */
		async handleSessionInstActive(index) {
			let sessTabItem = this.sessionInstTabs[index]
			if (!sessTabItem) {
				return
			}
			this.activeSession(sessTabItem.data)
		},

		/**
		 * 处理Session会话实例的移除
		 */
		async handleSessionInstRemove(index) {
			const { title, session } = this.sessionInstTabs[index]
			// 首页不需要确认
			if (title === 'Welcome') {
				this.sessionRemoveWithNoConfirm(index)
				return
			}

			const isEditor = session && session.type === 'editor'
			this.$confirm(
				this.T(`home.session-instance.${ isEditor ? 'save-dialog.message' : 'delete-dialog.title' }`),
				this.T(`home.session-instance.${ isEditor ? 'save-dialog.title' : 'delete-dialog.message' }`),
				{
					type: 'warning'
				}
			)
				.then(() => {
					session.beforeClose()
					this.sessionRemoveWithNoConfirm(index)
				})
				.catch(() => {
				})
		},

		async sessionRemoveWithNoConfirm(index) {
			if (this.currentSessionTabIdx === index) {
				this.currentSessionTabIdx -= 1
				this.currentSessionTabIdx = this.currentSessionTabIdx > 0 ? this.currentSessionTabIdx : 0
			}

			let sessTabItem = this.sessionInstTabs[index]
			let session = sessTabItem.data
			session.close()
		},

		/**
		 * 处理会话Tab的右键菜单
		 */
		handleSessionTabsContextMenu(tabItemIdx) {
			this.sessionContextMenuTabIndex = tabItemIdx
			let sessTabItem = this.sessionInstTabs[tabItemIdx]
			this.sessionContextMenuTabType = sessTabItem.data.type
		},

		async handleSessionContextMenuClose() {
			await this.handleSessionInstRemove(this.sessionContextMenuTabIndex)
		},

		getSessionTabContextMenu() {
			let menus = this.sessionTabContextMenu[this.sessionContextMenuTabType]
			if (!menus) {
				menus = this.sessionTabContextMenu['unknow']
			}
			return menus
		},

		async handleCopy() {
			let sessTabItem = this.sessionInstTabs[this.sessionContextMenuTabIndex]
			let session = sessTabItem.data
			await this.$sessionManager.duplicateSessionInstance(session)
		},

		async handleClose() {
			await this.handleSessionInstRemove(this.sessionContextMenuTabIndex)
		},

		async handleCloseLeft() {
			let index = this.sessionContextMenuTabIndex - 1
			if (index < 0) {
				return
			}
			let session_close = []
			for (let i = 0; i <= index; ++i) {
				session_close.push(this.sessionInstTabs[i])
			}

			session_close.forEach((item) => {
				let session = item.data
				session.close()
			})
		},

		async handleCloseRight() {
			let len = this.sessionInstTabs.length
			let index = this.sessionContextMenuTabIndex + 1
			if (index > len - 1) {
				return
			}

			let session_close = []
			for (let i = index; i < len; ++i) {
				session_close.push(this.sessionInstTabs[i])
			}

			session_close.forEach((item) => {
				let session = item.data
				session.close()
			})
		},

		async handleCloseOther() {
			let len = this.sessionInstTabs.length
			let session_close = []
			for (let i = 0; i < len; ++i) {
				if (i != this.sessionContextMenuTabIndex) {
					session_close.push(this.sessionInstTabs[i])
				}
			}

			session_close.forEach((item) => {
				let session = item.data
				session.close()
			})
		},

		async handleProp() {
			const sessTabItem = this.sessionInstTabs[this.sessionContextMenuTabIndex]
			const sessionInstance = sessTabItem.data
			const sessionConfig = this.$sessionManager.getSessionConfigByInstanceId(sessionInstance.getId())
			await this.$sessionManager.createShellSettingSessionInstance(sessionConfig)
		},

		/**
		 * 树容器操作
		 */
		handleSessionTreeContainerClick() {
			this.currentSelectSessionNode = null
			this.$refs.sessionTree.clearSelection()
		},

		handleSessionTreeContainerContextMenu() {
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

		getSessionConfigTreeContextMenu() {
			if (this.currentSelectSessionNodeConfigType === SESSION_CONFIG_TYPE.FOLDER) {
				return this.sessionConfigsTreeContextMenu.folder
			}

			if (this.currentSelectSessionNodeConfigType === SESSION_CONFIG_TYPE.NODE) {
				// TODO: 获取SessionConfig的状态，过滤掉一些无用状态
				return this.sessionConfigsTreeContextMenu.node
			}
		},

		// 创建目录
		handleSessionTreeContextMenu_CreateFolder() {
			this.showAddFolderDialog()
		},

		handleSessionTreeContextMenu_CreateSessionConfig() {
			this.gotoCreateShellSession()
		},

		// 删除会话或者会话目录
		handleSessionTreeContextMenu_Delete() {
			const { data, node } = this.currentSelectSessionNode
			const sessCfgData = data.data
			const sessCfg = this.$sessionManager.getSessionConfigById(sessCfgData._id)

			const message =
				sessCfg.type == SESSION_CONFIG_TYPE.NODE
					? this.T('home.host-manager.dialog-delete-confirm.delete-node', sessCfg.name)
					: this.T('home.host-manager.dialog-delete-confirm.delete-folder', sessCfg.name)

			this.$confirm(message, this.T('home.host-manager.dialog-delete-confirm.title'), {
				type: 'warning'
			}).then(() => {
				this.$sessionManager.removeSessionConfig(sessCfg)
				node.remove()
				this.updateSessionTree()
			}).catch((err) => {
				console.error(err)
			})
		},
		// 重命名会话文件夹
		handleSessionTreeContextMenu_RenameFolder() {
			this.sessionFolderEditDialog.data.folderName = this.currentSelectSessionNode.data.data.name
			this.showEditFolderDialog()
		},
		// 连接一个会话
		handleSessionTreeContextMenu_Connect() {
			this.handleHostOpen(this.currentSelectSessionNode)
		},
		handleSessionTreeContextMenu_SFTP() {
			this.handleOpenSFTP(this.currentSelectSessionNode.data)
		},
		// 剪切会话
		handleSessionTreeContextMenu_Cut() {
			this.treeOpClipboardCut(this.currentSelectSessionNode)
		},
		// 复制会话
		handleSessionTreeContextMenu_Copy() {
			this.treeOpClipboardCopy(this.currentSelectSessionNode)
		},
		// 粘贴会话
		handleSessionTreeContextMenu_Paste() {
			const pasteData = this.treeOpClipboardPaste()
			if (!pasteData) {
				return
			}
			// 追加新的节点
			if (pasteData.operate === 'cut') {
				// 复制原有节点数据
				// TODO: 移除原有的节点
				this.handleTreeNodeMove({
					dest: this.currentSelectSessionNode.node.nodeData.data.data,
					destPosition: 'after',
					source: pasteData.data.node.nodeData.data.data
				})
				// return;
				pasteData.data.node.remove()
				if (this.currentSelectSessionNode.node.isFolder) {
					this.currentSelectSessionNode.node.appendChild(pasteData.data.node.nodeData.data)
				} else {
					this.currentSelectSessionNode.node.appendSibling(pasteData.data.node.nodeData.data, 'after')
				}
			} else {
				const srcSessionConfig = this.$sessionManager.getSessionConfigById(
					pasteData.data.node.nodeData.data.data._id
				)
				const newSessionConfig = srcSessionConfig.duplicate()
				this.addSessionConfig(newSessionConfig)
			}
		},
		// 查看编辑会话配置
		async handleSessionTreeContextMenu_Prop() {
			const { data } = this.currentSelectSessionNode
			const sessCfg = this.$sessionManager.getSessionConfigById(data.data._id)
			await this.$sessionManager.createShellSettingSessionInstance(sessCfg)
		},

		async handleOpenSFTP(sessCfg) {
			this.$sessionManager.createSFTPSessionInstance(sessCfg.data)
		},

		async handleSessionTreeContextMenu_SaveConfig() {
			const coreService = powertools.getService('powertools-core')
			const selectedFiles = await coreService.showSaveDialog({
				properties: ['openFile']
			})

			if (selectedFiles.canceled) {
				return
			}

			const filePath = selectedFiles.filePath
			try {
				await this.$sessionManager.exportConfig(filePath)
			} catch (e) {
				console.log('export config error ', e)
			}
		},

		async handleSessionTreeContextMenu_ImportConfig() {
			const coreService = powertools.getService('powertools-core')
			const selectedFiles = await coreService.showOpenDialog({
				properties: ['openFile']
			})

			if (selectedFiles.canceled) {
				return
			}

			const filePath = selectedFiles.filePaths[0]
			try {
				await this.$sessionManager.importConfig(filePath)
				this.updateSessionTree()
			} catch (e) {
				console.log('import config error ', e)
			}
		},

		/**
		 * 剪切板操作
		 */
		treeOpClipboardCut(node) {
			this.treeOpClipboard.data = node
			this.treeOpClipboard.operate = 'cut'
		},

		treeOpClipboardCopy(node) {
			this.treeOpClipboard.data = node
			this.treeOpClipboard.operate = 'copy'
		},

		treeOpClipboardPaste() {
			if (this.treeOpClipboard.data) {
				const data = this.treeOpClipboard
				// 当前只粘贴一次，避免不必要的麻烦
				this.treeOpClipboard = {
					data: null,
					operate: ''
				}
				return data
			}
			return null
		}
	}
}
</script>

<style lang="scss">
.home {
	position: relative;
	width: 100%;
	height: 100%;

	.host-tree-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		height: 40px;
		padding-left: 2px;
		background-color: var(--n-bg-color-base);

		.el-input {
			width: 213px;
		}

		.host-tree-btn {
			display: inline-block;
			box-sizing: border-box;
			text-align: center;
			padding: 5px;
			width: 32px;
			height: 32px;
			line-height: 22px;
			padding: 5px;
			color: var(--n-text-color-base);
			border-radius: 4px;
			background-color: var(--lightBackgroundColor);

			&:hover {
				cursor: pointer;
				background-color: #e91e63;
			}
		}
	}

	.host-tree-view {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		background-color: var(--lightBackgroundColor);
		color: var(--n-text-color-base);
		outline: none;
		// border: solid 1px var(--borderColor);

		.no-session-data {
			padding: 10px;
			text-align: center;
			color: var(--secondaryTextColor);
			font-size: 14px;
		}

		.session-extend {
			display: inline-flex;
			justify-content: flex-end;
			align-items: center;
			flex-grow: 1;

			.pt-icon {
				cursor: pointer;
			}
		}
	}

	.sessions-container {
		width: 100%;
		height: calc(100% - 40px);
	}
}
</style>
