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
} from '@/layout/components/tabbar/tabs-utools'
import * as EventBus from '@/services/eventbus'
import { mapActions, mapState } from 'vuex'
import { contextMenuMixin } from './context-menu-mixin'

export default {
	name: 'NxTabMenu',
	data() {
		return {
			sessionContextMenuTabIndex: -1,
			sessionContextMenuTabType: 'shell',
			getTabContextMenu: () => {
				return this.getSessionTabContextMenu()
			}
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
		EventBus.subscript('updateTabBySessionId', (session_id) => {
			const activeSessionIndex = this.$store.getters.sessionInstTabs.findIndex((inst) => {
				return inst.data.id === session_id
			})

			if ((activeSessionIndex < 0) || (activeSessionIndex === this.activeTabIndex)) {
				return
			}

			this.handleSessionInstActive(activeSessionIndex || 0)
		})
		// 绑定快捷键
		this.setupBarShortCut()
	},
	computed: {
		...mapState(['activeTabIndex', 'sessionInstTabs', 'globalSettings', 'editorChange'])
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
			debugger
			// 首页不需要确认
			if (title === 'Welcome') {
				session.close()
				return
			}
			// 编辑器特殊处理
			if (session.type === 'editor' && !this.editorChange) {
				session.beforeClose()
				session.close()
				this.$store.dispatch('updateActiveTabIndex', index)
				return
			} else {
				this.$confirm(
					this.T("home.session-instance.save-dialog.message"),
					this.T("home.session-instance.save-dialog.title"),
					{
						cancelButtonText: '不保存',
						showClose: false
					}).then(() => {
					session.beforeClose()
					session.close()
				}).catch(() => {
					session.close()
				})
				return
			}
			const noConfirm = this.globalSettings['noCloseConfirm']
			if (noConfirm === 1 && session.type !== "editor") {
				session.beforeClose()
				session.close()
				this.$store.dispatch('updateActiveTabIndex', index)
				return
			}
			const isEditor = session && session.type === 'editor'
			const h = this.$createElement;
			this.$msgbox({
				title: this.T(`home.session-instance.${ isEditor ? 'save-dialog.title' : 'delete-dialog.message' }`),
				message: h('div',
					{
						style: 'display:flex;flex-direction: column;row-gap: 20px'
					},
					[
						h('div',
							{
								style: 'display:flex;align-items: center;column-gap: 10px;'
							},
							[
								h('i', {
									class: 'el-icon-warning',
									style: 'font-size: 20px;color: #E6A23C'
								}),
								this.T(`home.session-instance.${ isEditor ? 'save-dialog.message' : 'delete-dialog.title' }`)
							]
						),
						h('el-checkbox', {
							props: {
								label: '下次不再确认',
								trueLabel: 1,
								falseLabel: 0
							},
							on: {
								change: (value) => this.$store.dispatch('updateGlobalSettings', { noCloseConfirm: value })
							}
						}, null)
					]
				),
				showClose: false,
				showCancelButton: true,
				closeOnClickModal: false,
				cancelButtonText: this.T('components.Cancel'),
				confirmButtonText: this.T('components.OK')
			}).then(() => {
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
			const {
				data: { type }
			} = this.sessionInstTabs[tabItemIdx]
			this.sessionContextMenuTabType = type
		},
		getSessionTabContextMenu() {
			let menus = this.sessionTabContextMenu[this.sessionContextMenuTabType]
			if (!menus) {
				menus = this.sessionTabContextMenu['unknown']
			}
			return menus
		}
	}
}
</script>

<style lang="scss">
.nx-tabs-wrapper {
	width: 100%;
	height: 100%;
}


</style>
