<template>
	<div class="nx-tabs-wrapper">
		<pt-tab
			:tabs="data"
			:activeIndex="currentSessionTabIdx"
			:translate="true"
			@activate="handleSessionInstActive"
			@remove="handleSessionInstRemove"
			@contextmenu="handleSessionTabsContextMenu"
			v-context-menu="getTabContextMenu"/>
	</div>
</template>

<script>
export default {
	name: 'TitleBar',
	props: {
		data: {
			type: Array,
			require: true,
			default: () => []
		}
	},
	data() {
		return {
			sessionInstTabs: [],
			currentSessionTabIdx: 0,
			sessionContextMenuTabIndex: -1,
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
			getTabContextMenu: () => {
				return this.getSessionTabContextMenu()
			},
		}
	},
	methods: {
		handleSessionInstActive() {
		},
		handleSessionInstRemove(index) {
			const {title, session} = this.sessionInstTabs[index]
			// 首页不需要确认
			if (title === 'Welcome') {
				this.sessionRemoveWithNoConfirm(index)
				return
			}

			const isEditor = session && session.type === 'editor'
			this.$confirm(
				this.T(`home.session-instance.${isEditor ? 'save-dialog.message' : 'delete-dialog.title'}`),
				this.T(`home.session-instance.${isEditor ? 'save-dialog.title' : 'delete-dialog.message'}`),
				{
					type: 'warning'
				}
			).then(() => {
				session.beforeClose()
				this.sessionRemoveWithNoConfirm(index)
			}).catch(() => {
			})
		},
		async sessionRemoveWithNoConfirm(index) {
			if (this.currentSessionTabIdx === index) {
				this.currentSessionTabIdx -= 1
				this.currentSessionTabIdx = this.currentSessionTabIdx > 0 ? this.currentSessionTabIdx : 0
			}

			const {data: session} = this.sessionInstTabs[index]
			session.close()
		},
		/**
		 * 处理会话Tab的右键菜单
		 */
		handleSessionTabsContextMenu(tabItemIdx) {
			this.sessionContextMenuTabIndex = tabItemIdx
			const {data: {type}} = this.sessionInstTabs[tabItemIdx]
			this.sessionContextMenuTabType = type
		},
		getSessionTabContextMenu() {
			let menus = this.sessionTabContextMenu[this.sessionContextMenuTabType]
			if (!menus) {
				menus = this.sessionTabContextMenu['unknow']
			}
			return menus
		},
	}
}
</script>

<style lang="scss" scoped>
.nx-tabs-wrapper {
	width: 100%;
	height: 100%;
}
</style>