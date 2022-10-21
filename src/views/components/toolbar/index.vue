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
	</div>
</template>

<script>
import Space from '@/components/space/index.vue'
import * as EventBus from '@/services/eventbus'

export default {
	name: 'NxToolbar',
	components: { Space },
	props: {
		visible: false
	},
	data() {
		return {
			searchKeywords: ''
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
		async gotoCreateShellSession() {
			const sessCfg = this.$sessionManager.createShellSessionConfig(this.T('home.profile.default-session-name'))
			this.addSessionConfig(sessCfg)
			await this.$sessionManager.createShellSettingSessionInstance(sessCfg)
		},
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
		::v-deep .el-input__inner {
			background-color: var(--backgroundColor) !important;
			//transition: all 2s ease-in;
			//-webkit-transition: all 0.75s ease-in;

			&:focus {
				color: #fff;
				background-color: var(--btnPrimaryHoverBackgroundColor) !important;
			}
		}
	}

	.host-tree-btn {
		display: inline-block;
		box-sizing: border-box;
		text-align: center;
		padding: 5px;
		width: 32px;
		height: 32px;
		line-height: 22px;
		color: var(--primaryTextColor);
		border-radius: 4px;
		background-color: var(--btnPrimaryBackgroundColor);

		&:hover {
			cursor: pointer;
			background-color: var(--btnPrimaryHoverBackgroundColor);
		}
	}
}
</style>