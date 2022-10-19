<template>
	<div ref="nxTabs" class="pt-tab">
		<div class="content">
			<Space>
				<pt-tab-item
					v-for="(tabItem, idx) in tabs"
					:key="idx"
					:icon="tabItem.icon"
					:title="translate ? T(tabItem.title) : tabItem.title"
					:selected="idx === currentTab"
					:showSplit="idx !== currentTab && idx + 1 !== currentTab && idx !== tabs.length - 1 && !flat"
					:hideClose="hideClose"
					@click="handleClick(idx)"
					@close="handleClose(idx)"
					@contextmenu="handleContextMenu(idx)" />
			</Space>
		</div>
	</div>
</template>

<script>
import BScroll from '@better-scroll/core'
import MouseWheel from '@better-scroll/mouse-wheel'
import Space from '@/components/space'

BScroll.use(MouseWheel)
export default {
	name: 'PtTab',
	components: {Space},
	props: {
		tabs: {
			type: Array,
			default() {
				/**
				 * {
				 *     icon: 'iconName',
				 *     title: 'title',
				 *     data: any
				 * }
				 */
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
			this.scrollBar = new BScroll(this.$refs.nxTabs, {scrollX: true, mouseWheel: true})
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
	height: 40px;
	box-sizing: border-box;
	overflow: hidden;
	background-color: var(--tabs-bg-color);

	.content {
		display: inline-block;
		padding: 5px 10px;
		white-space: nowrap;
	}
}
</style>
