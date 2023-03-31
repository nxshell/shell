<template>
	<div
		class="nx-menu-wrapper"
		v-context-menu="contextMenus.empty"
		@contextmenu.stop="handleSessionTreeContainerClick"
		@click="handleSessionTreeContainerClick"
	>
		<!-- 提示创建会话配置 -->
		<el-scrollbar style="height: calc(100% - 32px)">
			<el-tree
				ref="sessionTreeRef"
				node-key="id"
				icon-class="empty"
				draggable
				:highlight-current="menuProps.highlightCurrent"
				:data="menuTree"
				:default-expanded-keys="menuProps.expandedKeys"
				:props="{ children: 'children', label: 'text' }"
				@node-contextmenu="nodeContextmenu"
				@node-drop="handleNodeDrop"
				@node-expand="handleNodeExpand"
				@node-collapse="handleNodeCollapse"
				@node-click="handleNodeSelected"
			>
				<template v-slot="{ node, data: { type, protocol, children, data } }">
					<span class="custom-tree-node" @dblclick.stop="handleHostOpen(data)">
						<n-space>
							<n-icon v-if="!children" type="svg" v-bind:name="formatIconName(data)" size="18" />
							<i v-else-if="node.expanded" class="el-icon-folder-opened" style="font-size: 18px" />
							<i v-else class="el-icon-folder" style="font-size: 18px" />
							<span :title="node.label || '-'">{{ node.label }}</span>
						</n-space>
						<el-tooltip
							v-if="type === 'node' && protocol === 'ssh'"
							effect="dark"
							:content="$t('home.sessions-context-menu.sftp')"
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
				v-if="!search && menuTree.length === 0"
				:description="$t('home.host-manager.session-tree.no-session-data')"
			/>
			<el-empty
				v-if="search && menuTree.length === 0"
				:description="$t('home.host-manager.session-tree.no-search-result')"
			/>
		</el-scrollbar>
		<!--编辑文件夹-->
		<nx-folder-dialog ref="folderDialogRef" @ok="handleOk" />
		<!-- SSH会话弹窗 -->
		<ssh-modal ref="sshModalRef" @ok="handleSessionOk" />
	</div>
</template>

<script setup>
import { SESSION_CONFIG_TYPE } from '@/services/sessionMgr'
import {
	addSessionConfig,
	handleSessionTreeContextMenu_Connect,
	handleSessionTreeContextMenu_ImportConfig,
	handleSessionTreeContextMenu_RenameFolder,
	handleSessionTreeContextMenu_SaveConfig,
	treeOpClipboardCopy,
	treeOpClipboardCut
} from './tools'
import { subscript } from '@/services/eventbus'
import NxFolderDialog from './components/FolderDialog.vue'
import NSpace from '@/components/space'
import { showContextMenu } from '@/components/menu/contextmenu'
import { storeToRefs } from 'pinia'
import { useNxTabsStore, useSessionStore } from '@/store'
import { SshModal } from '@/views/components'
import { getCurrentInstance, nextTick, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n-bridge'

const sessionTreeRef = ref()
const folderDialogRef = ref()
const sshModalRef = ref()
const { t } = useI18n()
const menuProps = reactive({
	highlightCurrent: false,
	expandedKeys: []
})
const nxTabStore = useNxTabsStore()
const sessionStore = useSessionStore()
const {} = storeToRefs(nxTabStore)
const { menuTree, search, currentNode } = storeToRefs(sessionStore)
const proxy = getCurrentInstance().proxy

const createFolder = (name) => {
	folderDialogRef.value?.show(name)
}
const gotoCreateShellSession = async () => {
	const sessionConfig = proxy.$sessionManager.createShellSessionConfig(t('home.profile.default-session-name'))
	addSessionConfig(sessionConfig)
	await proxy.$sessionManager.createShellSettingSessionInstance(sessionConfig)
}

const clipboard = reactive({
	data: null,
	operate: ''
})

const treeOpClipboardPaste = () => {
	const { data } = clipboard
	try {
		return (data && clipboard) || null
	} catch (error) {
		console.error('剪切复制异常', error)
		return null
	} finally {
		// 当前只粘贴一次，避免不必要的麻烦
		clipboard.data = null
		clipboard.operate = ''
	}
}
const handleOpenSFTP = (data) => {
	proxy.$sessionManager.createSFTPSessionInstance(data)
}

const handleSessionTreeContextMenu_SFTP = () => {
	proxy.$sessionManager.createSFTPSessionInstance(currentNode.value.sessionData)
}

// 剪切会话
const handleSessionTreeContextMenu_Cut = () => {
	treeOpClipboardCut(currentNode.value)
}
// 复制会话
const handleSessionTreeContextMenu_Copy = () => {
	treeOpClipboardCopy(currentNode.value)
}
// 粘贴会话
const handleSessionTreeContextMenu_Paste = () => {
	const pasteData = treeOpClipboardPaste()
	if (!pasteData) {
		return
	}
	// 追加新的节点
	const {
		data: { data: nodeData, node, treeNode },
		operate
	} = pasteData
	const sourceSessionConfig = proxy.$sessionManager.getSessionConfigById(nodeData.id)
	if (sourceSessionConfig) {
		// 如果是剪切则移除旧节点数据
		if (operate === 'cut') {
			treeNode.remove(nodeData)
			sourceSessionConfig._parent.removeSubSessionConfig(sourceSessionConfig, true)
		}
		// 新增会话
		addSessionConfig(operate === 'cut' ? sourceSessionConfig : sourceSessionConfig.duplicate())
	} else {
		console.warn('srcSessionConfig is null')
	}
}
// 查看编辑会话配置
const handleSessionTreeContextMenu_Prop = async () => {
	const { data } = currentNode.value
	const sessCfg = proxy.$sessionManager.getSessionConfigById(data.data._id)
	await proxy.$sessionManager.createShellSettingSessionInstance(sessCfg)
}
// 删除会话或者会话目录
const handleSessionTreeContextMenu_Delete = () => {
	const { data, node } = this.currentSelectedSessionNode
	const { _id } = data.data
	const sessionConfig = proxy.$sessionManager.getSessionConfigById(_id)
	const message =
		sessionConfig.type === SESSION_CONFIG_TYPE.NODE
			? this.$t('home.host-manager.dialog-delete-confirm.delete-node', [sessionConfig.name])
			: this.$t('home.host-manager.dialog-delete-confirm.delete-folder', [sessionConfig.name])
	this.$confirm(message, this.$t('home.host-manager.dialog-delete-confirm.title'), {
		type: 'warning'
	}).then(() => {
		proxy.$sessionManager.removeSessionConfig(sessionConfig)
		handleSessionTreeContainerClick()
		sessionStore.updateProcess()
	})
}
const contextMenus = {
	folder: [
		{
			label: 'home.sessions-context-menu.create-folder',
			type: 'normal',
			handler: createFolder
		},
		{
			label: 'home.sessions-context-menu.create-session',
			type: 'submenu',
			handler: gotoCreateShellSession,
			submenu: [
				{
					label: 'SSH',
					type: 'normal'
				},
				{
					label: 'SFTP',
					type: 'normal'
				},
				{
					label: 'Serial',
					type: 'normal'
				},
				{
					label: 'Telnet',
					type: 'normal'
				},
				{
					label: 'VNC',
					type: 'normal'
				}
			]
		},
		{
			label: 'home.sessions-context-menu.cut',
			type: 'normal',
			handler: handleSessionTreeContextMenu_Cut
		},
		{
			label: 'home.sessions-context-menu.copy',
			type: 'normal',
			handler: handleSessionTreeContextMenu_Copy
		},
		{
			label: 'home.sessions-context-menu.paste',
			type: 'normal',
			handler: handleSessionTreeContextMenu_Paste
		},
		{
			label: 'home.sessions-context-menu.delete',
			type: 'normal',
			handler: handleSessionTreeContextMenu_Delete
		},
		{
			label: 'home.sessions-context-menu.rename',
			type: 'normal',
			handler: handleSessionTreeContextMenu_RenameFolder
		}
	],
	node: [
		{
			label: 'home.sessions-context-menu.connect',
			type: 'normal',
			handler: handleSessionTreeContextMenu_Connect
		},
		{
			label: 'home.sessions-context-menu.cut',
			type: 'normal',
			handler: handleSessionTreeContextMenu_Cut
		},
		{
			label: 'home.sessions-context-menu.copy',
			type: 'normal',
			handler: handleSessionTreeContextMenu_Copy
		},
		{
			label: 'home.sessions-context-menu.delete',
			type: 'normal',
			handler: handleSessionTreeContextMenu_Delete
		},
		{
			label: 'home.sessions-context-menu.prop',
			type: 'normal',
			handler: handleSessionTreeContextMenu_Prop
		}
	],
	empty: [
		{
			label: 'home.sessions-context-menu.create-folder',
			type: 'normal',
			handler: createFolder
		},
		{
			label: 'home.sessions-context-menu.create-session',
			type: 'submenu',
			handler: gotoCreateShellSession,
			submenu: [
				{
					label: 'SSH',
					type: 'normal'
				},
				{
					label: 'SFTP',
					type: 'normal'
				},
				{
					label: 'Serial',
					type: 'normal'
				},
				{
					label: 'Telnet',
					type: 'normal'
				},
				{
					label: 'VNC',
					type: 'normal'
				}
			]
		},
		{
			label: 'home.sessions-context-menu.save-config',
			type: 'normal',
			handler: handleSessionTreeContextMenu_SaveConfig
		},
		{
			label: 'home.sessions-context-menu.import-config',
			type: 'normal',
			handler: handleSessionTreeContextMenu_ImportConfig
		}
	]
}

const handleNodeDrop = async (source, parentNode, position) => {
	const targetSession = proxy.$sessionManager.getSessionConfigById(parentNode.data.data._id)
	const sourceNode = proxy.$sessionManager.getSessionConfigById(source.data.data._id)
	sourceNode._parent.removeSubSessionConfig(sourceNode, true)
	if (position === 'inner') {
		targetSession.addSessionConfig(sourceNode)
	} else {
		const { index } = targetSession._parent.findSubSessionConfig(parentNode.data.data._id)
		const destIndex = index + (position === 'before' ? 0 : 1)
		targetSession._parent.addSessionConfig(sourceNode, destIndex)
	}
	await proxy.$sessionManager.saveSessionConfigs()
	sessionStore.updateProcess()
}

/**
 * 树容器操作
 */
const handleSessionTreeContainerClick = () => {
	sessionStore.updateCurrentNode(sessionTreeRef.value)
	menuProps.highlightCurrent = false
}

const handleNodeExpand = (data, node) => {
	menuProps.expandedKeys = [node.key]
}

const handleNodeCollapse = (data, node, vnode, element) => {
	menuProps.expandedKeys.splice(menuProps.expandedKeys.findIndex((item) => item === node.key), 1)
}

const handleNodeSelected = (data, node, _vnode, _element) => {
	// 修复由于当前文件夹下子元素为0 导致tree无法触发原有打开关闭事件
	if (data.isFolder && data.children.length === 0) node.expanded = !node.expanded
	const { data: sessionData } = data
	sessionStore.updateCurrentNode(sessionTreeRef.value, node, data)
	if (data.isFolder) {
		// 目录节点不启动会话实例
		return
	}
	// 尝试激活会话实例窗口
	const sessionInstance = proxy.$sessionManager.matchSessionInstanceByConfig(sessionData)
	if (!sessionInstance) {
		// 没有匹配到则创建新的实例
		return
	}

	nextTick(() => {
		nxTabStore.activateSessionByInstance(sessionInstance[0])
	})
}

const nodeContextmenu = (event, data, node, vnode) => {
	sessionStore.updateCurrentNode(sessionTreeRef.value, node, data)
	const { type: nodeType } = data.data
	let menuContent = []
	if (data.isFolder) {
		menuContent = contextMenus.folder
	}

	if (nodeType === SESSION_CONFIG_TYPE.NODE) {
		// TODO: 获取SessionConfig的状态，过滤掉一些无用状态
		const contextMenu = [...contextMenus.node]
		const {
			config: { protocal }
		} = data.data
		if (protocal === 'ssh') {
			contextMenu.unshift({
				label: 'home.sessions-context-menu.sftp',
				type: 'normal',
				handler: handleSessionTreeContextMenu_SFTP
			})
		}
		menuContent = contextMenu
	}
	showContextMenu(menuContent, event)
}

/**
 * 打开会话
 *
 * @param sessionData
 * @return {Promise<void>}
 */
const handleHostOpen = async (sessionData) => {
	if (sessionData.type === SESSION_CONFIG_TYPE.FOLDER) {
		// 目录节点不启动会话实例
		return
	}
	await proxy.$sessionManager.createSessionInstance(sessionData)
}

const formatIconName = (value) => {
	return 'linux'
	// console.log(value)
	// return !value ? 'linux' : getSystemIcon(value.config.osType)
}

const handleOk = () => {
}
const handleSessionOk = () => {
}

onMounted(() => {
	// 订阅主机搜索事件
	subscript('nx-menu-search', (keywords) => {
		sessionStore.updateProcess(keywords)
	})
	// 订阅新建文件夹事件
	subscript('create-session-folder', createFolder)
	// 订阅菜单刷新事件
	subscript('refresh-session-tree', sessionStore.updateProcess)
	// 订阅会话创建事件
	subscript('create-session-toolbar', () => {
		// gotoCreateShellSession()
		sshModalRef.value?.showModal()
	})
	nextTick(() => {
		sessionStore.updateCurrentNode(sessionTreeRef.value)
		// appendSessionConfig({ data: null, node: null, treeNode: $refs.sessionTree })
	})
})
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
}
</style>
