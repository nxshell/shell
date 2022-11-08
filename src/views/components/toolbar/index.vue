<template>
	<div v-if="visible" v-bind="$attrs" class="nx-toolbar">
		<el-input
			v-model="searchKeywords"
			:placeholder="T('home.host-manager.search.placeholder')"
			class="nx-search-input"
			clearable
			suffix-icon="el-icon-search"
		/>
		<n-space :size="5">
			<el-tooltip class="item" effect="dark" content="新建分组" placement="top-start">
				<span class="host-tree-btn" @click="handleCreateFolder">
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
		<nx-folder-dialog ref="createFolderRef" @ok="handleOk" />
	</div>
</template>

<script>
import * as EventBus from '@/services/eventbus'
import {SESSION_CONFIG_TYPE, SessionConfig} from '@/services/sessionMgr'
import {mapState} from 'vuex'
import NxFolderDialog from '../folderDialog/index.vue'

export default {
	name: 'NxToolbar',
	props: {
		visible: false
	},
	components: {NxFolderDialog},
	data() {
		return {
			searchKeywords: '',
			createFolderRules: {
				folderName: [{validator: this.validateFolderName, trigger: 'change'}]
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
				callback(new Error(this.T('home.fileview.createdir-dialog.placeholder')))
			} else if (/[\/:*?."'<>|]/.test(value)) {
				callback(new Error(this.T('home.fileview.createdir-dialog.invalid-dir-name')))
			} else {
				callback()
			}
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
		 * @param {SessionConfig} sessionConfig 会话配置
		 */
		addSessionConfig(sessionConfig) {
			const treeData = this.processSessionConfigTree([sessionConfig])[0]
			if (!this.currentSelectedSessionNode) {
				this.$sessionManager.addSessionConfig(null, sessionConfig)
				EventBus.publish('create-session-folder', treeData)
				return
			}
			let {data, node} = this.currentSelectedSessionNode
			if (node.isFolder) {
				node.appendChild(treeData)
				this.$sessionManager.addSessionConfig(data.data, sessionConfig)
				EventBus.publish('refresh-session-tree', {})
				return
			}
			// 需要判断节点是不是根目录下的节点
			node = node.getParentNode()
			if (!node) {
				EventBus.publish('create-session-folder', treeData)
				this.$sessionManager.addSessionConfig(null, sessionConfig)
			} else {
				const {data} = node.nodeData
				node.appendSibling(treeData)
				this.$sessionManager.addSessionConfig(data.data, sessionConfig)
			}
			EventBus.publish('refresh-session-tree', {})
		},
		async gotoCreateShellSession() {
			const sessionConfig = this.$sessionManager.createShellSessionConfig(
				this.T('home.profile.default-session-name')
			)
			this.addSessionConfig(sessionConfig)
			await this.$sessionManager.createShellSettingSessionInstance(sessionConfig)
		},
		handleCreateFolder() {
			this.$refs.createFolderRef?.show('')
		},
		handleOk(emitData) {
			this.addSessionConfig(emitData)
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
		transition: background-color 0.3s var(--n-bezier);
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
