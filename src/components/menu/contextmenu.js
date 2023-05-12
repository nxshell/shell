import Vue from 'vue'

import './contextmenu.scss'

const PtContextMenu = Vue.extend({
	data() {
		return {
			menuData: [],
			sourceEvent: null,
			selfRect: {
				left: 0,
				top: 0,
				right: 0,
				height: 0
			},
			visibility: false
		}
	},

	computed: {
		left() {
			let left = this.sourceEvent.x
			if (left + this.selfRect.width > window.innerWidth) {
				left -= this.selfRect.width
			}
			return left
		},

		top() {
			// 需要减去的高度（当在终端中，需要减去标题栏 40 tab栏 40 工具栏 40 美化效果 10）
			const subHeight = this.sourceEvent.target.getAttribute('class') === 'xterm-cursor-layer' ? 130 : 40
			// 实际内容高度
			const realHeight = window.innerHeight - subHeight

			let top = this.sourceEvent.y
			if (top + this.selfRect.height > window.innerHeight) {
				// 当真实高度 - 当前鼠标Y坐标 小于等于真实高度 1/3时，使用当前鼠标位置-菜单栏自身高度计算菜单栏top 否则使用subHeight
				// 如果计算后的高度小于subHeight 则使用苏北Height
				const calcTop = top - this.selfRect.height
				top = realHeight - top <= realHeight / 3 ? (calcTop < subHeight ? subHeight : calcTop) : subHeight
			}
			return top
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.getRect()
			this.visibility = true
		})
	},

	beforeDestroy() {
		this.$el.remove()
	},

	methods: {
		getRect() {
			if (!this.$el) {
				return { left: 0, top: 0, right: 0, height: 0 }
			}
			const rect = this.$el.getBoundingClientRect()
			this.selfRect = {
				left: rect.left,
				top: rect.top,
				width: rect.width,
				height: rect.height
			}
		},
		handlePopStack() {
			setTimeout(() => this.$destroy(), 100)
		}
	},

	render(h) {
		const menu = h('pt-menu', {
			props: {
				menu: this.menuData,
				translate: true
			},
			on: {
				'pop-stack': this.handlePopStack
			}
		})
		return h(
			'div',
			{
				class: {
					'context-menu': true
				},
				style: {
					left: this.left + 'px',
					top: this.top + 'px'
				}
			},
			[menu]
		)
	}
})

export function showContextMenu(menu, evt) {
	console.log('打开内容')
	// 没有内容禁止打开
	if (!menu || menu.length === 0) {
		return
	}
	const contextMenuNode = document.createElement('div')
	document.body.appendChild(contextMenuNode)
	new PtContextMenu({
		data: {
			menuData: menu,
			sourceEvent: evt
		}
	}).$mount(contextMenuNode)
}

export default {
	install() {
		Object.defineProperty(Vue.prototype, '$showContextMenu', {
			get() {
				return showContextMenu
			}
		})
	}
}
