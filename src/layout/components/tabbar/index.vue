<template>
	<div ref="nxTabs" class="nx-tabs-wrapper">
		<transition-group name="drag" class="content" tag="div">
			<div
				v-for="(item, index) in sessionInstTabs"
				:key="item.data.id"
				class="tabs-item"
				:class="{ 'item-active': activeTabIndex === index }"
				draggable="true"
				@dragstart="dragstart(index)"
				@dragenter="dragenter($event, index)"
				@dragover.prevent
				@click.prevent="handleSessionInstActive(index)"
				v-context-menu="getTabContextMenu"
				@contextmenu.prevent="handleSessionTabsContextMenu(index)"
			>
				<n-space size="5" fill>
					<n-icon size="18" :name="item.icon.iconName" :type="item.icon.type" />
					<span>{{ $t(item.title) }}</span>
				</n-space>
				<span v-if="sessionInstTabs.length !==1 || sessionInstTabs[0].data.type !== 'welcome'" class="tabs-item__close" @click="handleSessionInstRemove(index)">
					<i class="el-icon-close"></i>
				</span>
			</div>
		</transition-group>
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
import { mapState } from 'vuex'
import { contextMenuMixin } from './context-menu-mixin'
import BScroll from '@better-scroll/core'
import MouseWheel from '@better-scroll/mouse-wheel'

BScroll.use(MouseWheel)

export default {
	name: 'NxTabMenu',
	data() {
		return {
			sessionContextMenuTabType: 'shell',
			getTabContextMenu: () => {
				return this.getSessionTabContextMenu()
			},
			dragIndex: null,
			scrollBar: null
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
		// 滚动条
		this.$nextTick(() => {
			this.scrollBar = new BScroll(this.$refs.nxTabs, {
				scrollX: true,
				mouseWheel: true,
				disableMouse: true, // 支持监听鼠标相关事件
				disableTouch: true, // 不监听touch相关事件
				preventDefault: false // 事件派发后不阻止默认行为，比如选中文字
			})
		})
	},
	computed: {
		...mapState(['activeTabIndex', 'sessionInstTabs', 'noCloseConfirm', 'editorChange'])
	},
	watch: {
		sessionInstTabs: function (n, o) {
			if (n.toString() !== o.toString()) {
				setTimeout(() => {
					this.scrollBar.refresh()
					// 获取当前选中的元素，之后将滚动到该位置
					const activeElement = document.getElementsByClassName(' item-active')[0]
					this.scrollBar.scrollToElement(activeElement, 500, true, false)
				}, 200)
			}
		}
	},
	updated() {
		this.scrollBar.refresh()
	},
	methods: {
		handleSessionInstActive,
		updateSessionInstTabs,
		activeSession,
		setupBarShortCut,
		async handleClose() {
			await this.handleSessionInstRemove(this.activeTabIndex)
		},
		handleSessionInstRemove(index) {
			const { title, data: session } = this.sessionInstTabs[index]
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
			} else if (session.type === 'editor') {
				this.$confirm(
					this.$t("home.session-instance.save-dialog.message"),
					this.$t("home.session-instance.save-dialog.title"),
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
			const noConfirm = this.$store.getters.noCloseConfirm
			if (noConfirm && session.type !== "editor") {
				session.beforeClose()
				session.close()
				this.$store.dispatch('updateActiveTabIndex', index)
				return
			}
			const isEditor = session && session.type === 'editor'
			const h = this.$createElement;
			this.$msgbox({
				title: this.$t(`home.session-instance.${ isEditor ? 'save-dialog.title' : 'delete-dialog.message' }`),
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
								this.$t(`home.session-instance.${ isEditor ? 'save-dialog.message' : 'delete-dialog.title' }`)
							]
						),
						h('el-checkbox', {
							props: {
								label: '下次不再确认',
							},
							trueLabel: true,
							falseLabel: false,
							on: {
								change: (value) => this.$store.dispatch('updateNoCloseConfirm', value)
							}
						}, null)
					]
				),
				showClose: false,
				showCancelButton: true,
				closeOnClickModal: false,
				cancelButtonText: this.$t('components.Cancel'),
				confirmButtonText: this.$t('components.OK')
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
			this.$store.dispatch('updateActiveTabIndex', tabItemIdx)
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
		},
		dragstart(index) {
			this.dragIndex = index
		},
		dragenter(e, index) {
			// 避免源对象触发自身的dragenter事件
			if (this.dragIndex !== index) {
				const moving = this.sessionInstTabs[this.dragIndex]
				this.sessionInstTabs.splice(this.dragIndex, 1)
				this.sessionInstTabs.splice(index, 0, moving)
				// 排序变化后目标对象的索引变成源对象的索引
				this.dragIndex = index
				this.$store.dispatch('updateActiveTabIndex', index)
			}
		}
	}
}
</script>
<style lang="scss" scoped>
.nx-tabs-wrapper {
	display: flex;
	align-items: center;
	width: 100%;
	height: 40px;
	overflow: hidden;
	white-space: nowrap;
	box-sizing: border-box;
	background-color: var(--n-tabs-bg-color);

	&::after {
		content: '';
		width: 5px;
		height: 100%;
	}

	.content {
		display: inline-flex;
		column-gap: 5px;

		.drag-move {
			transition: transform 0.3s;
		}

		.tabs-item {
			flex-shrink: 0;
			display: inline-flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 5px;
			height: 32px;
			font-size: 12px;
			color: var(--n-text-color-base);
			background: var(--n-tabs-item-bg-color);
			box-sizing: border-box;
			column-gap: 5px;

			&:hover {
				cursor: pointer;
				color: var(--n-tabs-item-active-color);
				font-weight: 600;
				background: var(--n-tabs-item-hover-bg-color);
			}

			&__close {
				display: inline-block;
				padding: 2px;
				border-radius: 2px;

				&:hover {
					background-color: #ffffff6b;
				}
			}
		}

		.item-active {
			font-weight: 600;
			color: var(--n-tabs-item-active-color);
			background: var(--n-tabs-item-hover-bg-color);
		}
	}
}
</style>
