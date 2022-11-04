<template>
	<div class="nx-tabs-wrapper">
		<pt-tab
			:tabs="sessionInstTabs"
			:activeIndex="activeTabIndex"
			:translate="true"
			@activate="handleSessionInstActive"
			@remove="handleSessionInstRemove"
			@contextmenu="handleSessionTabsContextMenu"
			v-context-menu="getTabContextMenu"
		/>
	</div>
</template>

<script>
import {
	activeSession,
	handleSessionInstActive,
	setupBarShortCut,
	updateSessionInstTabs
} from '@/views/components/tabbar/tabs-utools'
import * as EventBus from '@/services/eventbus'
import { mapState } from 'vuex'
import { contextMenuMixin } from './context-menu-mixin'

export default {
	name: 'TitleBar',
	data() {
		return {
			sessionContextMenuTabIndex: -1,
			sessionContextMenuTabType: 'shell',
			getTabContextMenu: () => {
				return this.getSessionTabContextMenu()
			},
		}
	},
	mixins: [contextMenuMixin],
	mounted() {
		EventBus.subscript('instance-created', (sessInst) => {
			this.updateSessionInstTabs()
			this.activeSession(sessInst)
		})
		EventBus.subscript('instance-destroyed', () => {
			this.updateSessionInstTabs()
			if (this.sessionInstTabs.length <= 0) {
				this.$sessionManager.createWelcomeSessionInstance()
			} else {
				if (this.activeTabIndex >= this.sessionInstTabs.length) {
					this.$store.dispatch('updateActiveTabIndex', this.sessionInstTabs.length - 1)
				}
				this.handleSessionInstActive(this.activeTabIndex || 0)
			}
		})
		// 绑定快捷键
		this.setupBarShortCut()
	},
	computed: {
		...mapState(['activeTabIndex', 'sessionInstTabs'])
	},
	methods: {
		handleSessionInstActive,
		updateSessionInstTabs,
		activeSession,
		setupBarShortCut,
		async handleClose() {
			await this.handleSessionInstRemove(this.sessionContextMenuTabIndex)
		},
		handleSessionInstRemove(index) {
			const { title, data: session } = this.sessionInstTabs[index]
			// 首页不需要确认
			if (title === 'Welcome') {
				session.close()
				return
			}
			const isEditor = session && session.type === 'editor'
			this.$confirm(
				this.T(`home.session-instance.${ isEditor ? 'save-dialog.message' : 'delete-dialog.title' }`),
				this.T(`home.session-instance.${ isEditor ? 'save-dialog.title' : 'delete-dialog.message' }`),
				{
					type: 'warning',
					closeOnClickModal: false
				}
			).then(() => {
				session.beforeClose()
				session.close()
				this.$store.dispatch('updateActiveTabIndex', index)
			}).catch(() => {
			})
		},

		/**
		 * 处理会话Tab的右键菜单
		 */
		handleSessionTabsContextMenu(tabItemIdx) {
			this.sessionContextMenuTabIndex = tabItemIdx
			const { data: { type } } = this.sessionInstTabs[tabItemIdx]
			this.sessionContextMenuTabType = type
		},
		getSessionTabContextMenu() {
			let menus = this.sessionTabContextMenu[this.sessionContextMenuTabType]
			if (!menus) {
				menus = this.sessionTabContextMenu['unknown']
			}
			return menus
		},
	}
}
</script>

<style lang="scss">
.nx-tabs-wrapper {
	width: 100%;
	height: 100%;


}

.el-popover {
	background-color: var(--n-color-modal) !important;
	min-width: 102px !important;
	box-sizing: border-box;
	border: 0 !important;

	.popper__arrow {
		border-bottom-color: var(--n-color-modal) !important;

		&::after {
			border-bottom-color: var(--n-color-modal) !important;
		}
	}
}
</style>