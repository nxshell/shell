<template>
	<div ref="nxTabs" class="pt-tab">
		<div class="content">
			<pt-tab-item
				v-for="(tabItem, idx) in tabs"
				:key="idx"
				:icon="tabItem.icon"
				:closable="tabItem.title !== 'Welcome'"
				:title="translate ? T(tabItem.title) : tabItem.title"
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
			this.scrollBar?.refresh()
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
	background-color: var(--n-tabs-bg-color);

	.content {
		display: inline-block;
		white-space: nowrap;

		.pt-tab-item:not(:last-child) {
			margin-right: 8px;
		}
	}
}
</style>
