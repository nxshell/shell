<template>
	<div ref="nxTabs" class="pt-tab">
		<div class="content">
			<pt-tab-item
				v-for="(tabItem, idx) in tabs"
				:key="idx"
				:icon="tabItem.icon"
				:closable="tabItem.title !== 'Welcome'"
				:title="translate ? $t(tabItem.title) : tabItem.title"
				:selected="idx === currentTab"
				:showSplit="idx !== currentTab && idx + 1 !== currentTab && idx !== tabs.length - 1 && !flat"
				:hideClose="hideClose"
				@click="handleClick(idx)"
				@close="handleClose(idx)"
				@contextmenu="handleContextMenu(idx)" />
		</div>
	</div>
</template>

<script>
import BScroll from '@better-scroll/core'
import MouseWheel from '@better-scroll/mouse-wheel'

BScroll.use(MouseWheel)
export default {
	name: 'PtTab',
	props: {
		tabs: {
			type: Array,
			default() {
				return []
			}
		},
		activeIndex: {
			type: Number,
			default: 0
		},
		flat: {
			type: Boolean,
			default: false
		},
		hideClose: {
			type: Boolean,
			default: false
		},
		translate: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			currentTab: -1,
			scrollBar: null
		}
	},

	watch: {
		tabs() {
			if (this.currentTab >= this.tabs.length) {
				this.currentTab = this.tabs.length - 1
			}
			setTimeout(() => {
				this.scrollBar.refresh()
				// 获取当前选中的元素，之后将滚动到该位置
				const activeElement = document.getElementsByClassName(' pt-tab-item--selected')[0]
				this.scrollBar.scrollToElement(activeElement, 500, true, false)
			}, 200)
		},
		activeIndex(newVal) {
			if (newVal !== this.currentTab) {
				this.handleClick(newVal)
			}
		}
	},

	created() {
		this.currentTab = this.activeIndex
	},
	mounted() {
		this.$nextTick(() => {
			this.scrollBar = new BScroll(this.$refs.nxTabs, { scrollX: true, mouseWheel: true })
		})
	},
	methods: {
		handleClick(idx) {
			this.currentTab = idx
			this.$emit('activate', idx)
		},
		handleClose(idx) {
			this.$emit('remove', idx)
		},
		handleContextMenu(idx) {
			this.$emit('contextmenu', idx)
		}
	},
	beforeDestroy() {
		this.scrollBar = null
	}
}
</script>

<style lang="scss" scoped>
.pt-tab {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	width: 100%;
	height: 40px;
	box-sizing: border-box;
	overflow: hidden;
	padding: 0 5px;
	white-space: nowrap;
	background-color: var(--n-tabs-bg-color);

	.content {
		display: inline-block;

		.pt-tab-item {
			padding-right: 5px;
		}
	}
}
</style>
