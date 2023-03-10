<template>
	<div
		class="pt-grid-view"
		v-mouse-drag="getSelectionHandler()"
		tabindex="-1"
		@keydown.prevent="handleKeydown"
		@contextmenu="handleViewContextMenu"
		@dragover.prevent
		@drop="handleFileDrop"
	>
		<div
			v-if="selection.isShow"
			class="select-rect"
			:style="{
				left: selectionRect.left + 'px',
				top: selectionRect.top + 'px',
				width: selectionRect.right - selectionRect.left + 'px',
				height: selectionRect.bottom - selectionRect.top + 'px'
			}"
		></div>
		<div v-if="mode === 'detail'" class="grid-view-header" @contextmenu.stop>
			<div class="columns">
				<div
					v-for="(column, idx) in columns"
					:key="column.dataKey + idx"
					class="column"
					:style="{
						width: columnsRenderInfo[idx].width + 'px',
						textAlign: columnsRenderInfo[idx].align
					}"
					@click.self="handleSort(column.dataKey)"
				>
					{{ $t(column.label) }}
					<span class="resize" v-mouse-drag="getColumnResizeHandler(idx)">|</span>
				</div>
			</div>
		</div>
		<scroll-container
			type="vertical"
			:size="10"
			@scroll="handleViewScroll"
			ref="scrollContainter"
			@scrollTop="handleScrollTop"
			@scrollBottom="handleScrollBottom"
		>
			<div class="item-container" :class="{ detail: mode === 'detail' }">
				<div
					class="item-placeholder"
					v-if="selection.isShow"
					:style="{
						height: viewVisual.topPlaceholderSize + 'px'
					}"
				></div>
				<pt-grid-view-item
					v-for="(item, idx) in renderItems"
					:key="idx"
					:width="itemWidth"
					:height="itemHeight"
					:colSpaceSize="colSpaceSize"
					:rowSpaceSize="rowSpaceSize"
					:selected="item.selected"
					:value="item.value"
					:mode="mode"
					:columns="columnsRenderInfo"
					@select="handleSelectItem($event, idx)"
					@open="handleOpenItem(idx)"
					@contextmenu="handleContextMenu(idx)"
				/>
				<div
					class="item-placeholder"
					v-if="selection.isShow"
					:style="{
						height: viewVisual.bottomPlaceholderSize + 'px'
					}"
				></div>
			</div>
		</scroll-container>
	</div>
</template>

<script>
import ScrollContainer from '../base/scrollcontainer'

const COLUMN_MIN_WIDTH = 100

const ITEM_SIZE = {
	detail: {
		width: -1,
		height: 20,
		colSpaceSize: 0,
		rowSpaceSize: 1
	},
	small: {
		width: 308,
		height: 20,
		rowSpaceSize: 1,
		colSpaceSize: 1
	},
	medium: {
		width: 74,
		height: 86,
		colSpaceSize: 10,
		rowSpaceSize: 1
	},
	large: {
		width: 105,
		height: 118,
		colSpaceSize: 10,
		rowSpaceSize: 1
	},
	huge: {
		width: 271,
		height: 278,
		colSpaceSize: 10,
		rowSpaceSize: 1
	},
	tile: {
		width: 250,
		height: 58,
		colSpaceSize: 10,
		rowSpaceSize: 1
	}
}

export default {
	name: 'PtGridView',
	components: {
		ScrollContainer
	},
	props: {
		/**
		 *  detail：详细列表
		 *  small: 小图标
		 *  medium: 中图标
		 *  large: 大图标
		 *  huge: 超大图标
		 *  tile: 平铺
		 */
		mode: {
			type: String,
			default: 'small'
		},
		data: {
			type: Array
		},
		iconFilter: {
			type: Function
		},

		/**
		 * 列：
		 *   {
		 *     dataKey: "", // 列字段
		 *     label: ""    // 列的标签显示
		 *   }
		 */
		columns: {
			type: Array,
			default() {
				// return [{
				//     "dataKey": "name",
				//     "label": "undefined"
				// }];
				return [
					{
						dataKey: 'name',
						label: '文件名',
						width: 120
					},
					{
						dataKey: 'size',
						label: '文件大小',
						width: 60,
						align: 'center'
					}
				]
			}
		}
	},

	data() {
		return {
			selection: {
				isShow: false,
				start: {
					x: 0,
					y: 0
				},

				end: {
					x: 0,
					y: 0
				},

				lastSelectItemIndex: 0
			},

			view: {
				scrollX: 0,
				scrollY: 0,
				clientX: 0,
				clientY: 0,
				width: 0,
				height: 0,
				cols: 0,
				rows: 0,
				renderStart: 0,
				renderEnd: 0
			},

			columnsRenderInfo: [],

			items: [],
			showItemContextMenu: false
		}
	},

	computed: {
		itemWidth() {
			return ITEM_SIZE[this.mode].width
		},
		itemHeight() {
			return ITEM_SIZE[this.mode].height
		},
		colSpaceSize() {
			return ITEM_SIZE[this.mode].colSpaceSize
		},
		rowSpaceSize() {
			return ITEM_SIZE[this.mode].rowSpaceSize
		},
		selectionRect() {
			return {
				left: Math.min(this.selection.start.x, this.selection.end.x),
				top: Math.min(this.selection.start.y, this.selection.end.y),
				right: Math.max(this.selection.start.x, this.selection.end.x),
				bottom: Math.max(this.selection.start.y, this.selection.end.y)
			}
		},

		renderItems() {
			if (!this.selection.isShow) {
				return this.items
			}

			const { startRow, endRow } = this.viewVisual

			const cols = this.view.cols

			return this.items.slice(startRow * cols, (endRow + 1) * cols)
		},

		viewVisual() {
			const itemHeight = this.itemHeight + this.rowSpaceSize
			const startRow = Math.floor(this.view.scrollY / itemHeight)
			const endRow = Math.ceil((this.view.scrollY + this.view.height) / itemHeight)
			const totalRow = Math.ceil(this.items.length / this.view.cols)

			const topPlaceholderSize = startRow * itemHeight
			const bottomPlaceholderSize = (totalRow - endRow) * itemHeight
			return {
				startRow,
				endRow,
				topPlaceholderSize,
				bottomPlaceholderSize
			}
		},
		mouseYDelta() {
			return this.mode === 'detail' ? 40 : 10
		}
	},

	watch: {
		data() {
			if (this.$refs.scrollContainter) {
				this.$refs.scrollContainter.reset()
			}
			this.initData()
		}
	},

	created() {
		this.initColumns()
		this.initData()
	},

	methods: {
		initData() {
			this._items = this.data.map((item) => {
				return {
					selected: false,
					value: item
				}
			})
			this.get_render_items()
		},

		get_render_items() {
			try {
				this.getViewSize()
			} catch (e) {}

			let render_total = 500
			this.view.renderStart = 0
			this.view.renderEnd = render_total > this._items.length ? this._items.length : render_total
			this.items = this._items.slice(this.view.renderStart, this.view.renderEnd)
		},

		initColumns() {
			this.columnsRenderInfo = this.columns.map((col) => {
				return {
					label: col.label,
					dataKey: col.dataKey,
					width: col.width || COLUMN_MIN_WIDTH,
					minWidth: col.minWidth || COLUMN_MIN_WIDTH,
					align: col.align || 'left',
					sort: false
				}
			})
		},
		getViewSize() {
			const { width, height } = this.$el.getBoundingClientRect()
			this.view.width = width
			this.view.height = height
			let itemWidth = this.itemWidth < 0 ? width - 20 : this.itemWidth
			let itemHeight = this.itemHeight < 0 ? height - 20 : this.itemHeight
			let colSpaceSize = this.itemWidth < 0 ? 0 : this.colSpaceSize
			let rowSpaceSize = this.itemHeight < 0 ? 0 : this.rowSpaceSize
			this.view.cols = Math.floor((width - 20) / (itemWidth + colSpaceSize))
			this.view.rows = Math.floor((height - 20) / (itemHeight + rowSpaceSize))
		},

		handleViewMousemove() {
			if (!this.selection.isShow) {
				return
			}

			let itemWidth = this.itemWidth + this.colSpaceSize
			if (this.itemWidth < 0) {
				itemWidth = this.view.width - 20
			}
			const { mouseYDelta } = this
			let startCol = Math.floor((this.selectionRect.left - 10 + this.view.scrollX) / itemWidth)
			let endCol = Math.floor((this.selectionRect.right - 10 + this.view.scrollX) / itemWidth)
			const itemHeight = this.itemHeight + this.rowSpaceSize
			let startRow = Math.floor((this.selectionRect.top - mouseYDelta + this.view.scrollY) / itemHeight)
			let endRow = Math.floor((this.selectionRect.bottom - mouseYDelta + this.view.scrollY) / itemHeight)

			for (let i = 0; i < this.items.length; i++) {
				let col = i % this.view.cols
				let row = Math.floor(i / this.view.cols)
				this.items[i].selected = col >= startCol && col <= endCol && row >= startRow && row <= endRow
			}
		},

		handleViewScroll({ x, y }) {
			this.view.scrollX = x
			this.view.scrollY = y
		},

		handleScrollTop() {
			if (this.view.renderStart > 0) {
				// scroll up
				let stepCount = Math.floor(this.view.cols * 3)
				let realLen = this.view.renderStart
				stepCount = stepCount > realLen ? realLen : stepCount
				this.view.renderStart -= stepCount
				this.view.renderEnd -= stepCount

				this.items = this._items.slice(this.view.renderStart, this.view.renderEnd)
				this.$refs.scrollContainter.scrollTo(0, 10)
			}
		},

		handleScrollBottom() {
			if (this.view.renderEnd < this._items.length) {
				// scroll down
				let stepCount = Math.floor(this.view.cols * 3)
				let realLen = this._items.length - this.view.renderEnd
				stepCount = stepCount > realLen ? realLen : stepCount
				this.view.renderStart += stepCount
				this.view.renderEnd += stepCount

				this.items = this._items.slice(this.view.renderStart, this.view.renderEnd)
				this.$refs.scrollContainter.scrollTo(0, this.view.scrollY - 10)
			}
		},

		getColumnResizeHandler(idx) {
			let column = this.columnsRenderInfo[idx]
			const handlers = {
				dragStart: () => {
					return true
				},
				dragMove: ({ movementX }) => {
					column.width += movementX
					return true
				},
				dragEnd: () => {
					if (column.width < column.minWidth) {
						column.width = column.minWidth
					}
				}
			}

			return handlers
		},

		getSelectionHandler() {
			return {
				dragStart: ({ x, y }) => {
					const { top, left } = this.$el.getBoundingClientRect()
					this.view.clientX = left
					this.view.clientY = top
					// this.view.clientX
					this.selection.isShow = true
					this.selection.start.x = x - this.view.clientX
					this.selection.start.y = y - this.view.clientY
					this.selection.end.x = this.selection.start.x
					this.selection.end.y = this.selection.start.y

					this.getViewSize()
					this.clearSelection()
				},
				dragMove: ({ movementX, movementY }) => {
					this.selection.end.x += movementX
					this.selection.end.y += movementY
					this.handleViewMousemove()
					this.emitChange()
				},
				dragEnd: () => {
					this.selection.isShow = false
				}
			}
		},

		selectOneItem(idx) {
			this.items.forEach((item, itemIdx) => {
				item.selected = idx === itemIdx
			})
			this.selection.lastSelectItemIndex = idx
		},

		selectMultiItem(idx) {
			this.items[idx].selected = !this.items[idx].selected
			this.selection.lastSelectItemIndex = idx
		},

		selectSerialItems(idx) {
			const start = Math.min(idx, this.selection.lastSelectItemIndex)
			const end = Math.max(idx, this.selection.lastSelectItemIndex)

			for (let i = 0; i < start; i++) {
				this.items[i].selected = false
			}

			for (let i = start; i <= end; i++) {
				this.items[i].selected = true
			}

			for (let i = end + 1; i < this.items.length; i++) {
				this.items[i].selected = false
			}
		},

		selectContextMenu(idx) {
			const item = this.items[idx]
			if (item.selected) {
				return
			}
			this.selectOneItem(idx)
		},

		emitChange(clear = false) {
			if (clear) {
				this.$emit('change', [])
				return
			}
			const ret = []
			for (let i = 0; i < this.items.length; i++) {
				const item = this.items[i]
				if (item.selected) {
					ret.push(i + this.view.renderStart)
				}
			}
			this.$emit('change', ret)
		},

		selectAllItems() {
			this.items.forEach((item) => {
				item.selected = true
			})
			this.emitChange()
		},

		handleSelectItem(evt, idx) {
			if (evt.type === 'normal') {
				this.selectOneItem(idx)
			} else if (evt.type === 'multi') {
				this.selectMultiItem(idx)
			} else if (evt.type === 'serial') {
				this.selectSerialItems(idx)
			} else if (evt.type === 'contextmenu') {
				this.selectContextMenu(idx)
			}
			this.emitChange()
		},

		clearSelection() {
			this.items.forEach((item) => {
				item.selected = false
			})
			this.emitChange(true)
		},

		handleOpenItem(idx) {
			this.$emit('open', idx + this.view.renderStart)
		},

		handleContextMenu(idx) {
			this.showItemContextMenu = true
			this.$emit('contextmenu', idx + this.view.renderStart)
		},

		handleViewContextMenu() {
			if (this.showItemContextMenu) {
				this.showItemContextMenu = false
				return
			}

			this.$emit('contextmenu')
		},

		handleKeydown(evt) {
			if (evt.code === 'Backspace') {
				this.$emit('go-back')
				return
			}
			if (evt.code === 'F5') {
				this.$emit('refresh')
				return
			}
			if (evt.key === 'Enter') {
				if (this.items[this.selection.lastSelectItemIndex].selected) {
					this.$emit('open', this.selection.lastSelectItemIndex)
				}
				return
			}
			if (evt.key === 'Delete') {
				this.$emit('delete')
			}

			if (evt.code === 'KeyA' && evt.ctrlKey) {
				this.selectAllItems()
				return
			}

			if (evt.code === 'KeyX' && evt.ctrlKey) {
				if (this.items[this.selection.lastSelectItemIndex].selected) {
					this.$emit('cut', this.selection.lastSelectItemIndex)
				}
			}

			if (evt.code === 'KeyC' && evt.ctrlKey) {
				if (this.items[this.selection.lastSelectItemIndex].selected) {
					this.$emit('copy', this.selection.lastSelectItemIndex)
				}
			}

			if (evt.code === 'KeyV' && evt.ctrlKey) {
				this.$emit('paste')
			}

			this.getViewSize()
			let moveCursor = 0

			if (evt.key === 'ArrowDown') {
				moveCursor = this.view.cols
			} else if (evt.key === 'ArrowUp') {
				moveCursor = -this.view.cols
			} else if (evt.key === 'ArrowLeft' && this.mode !== 'detail') {
				moveCursor = -1
			} else if (evt.key === 'ArrowRight' && this.mode !== 'detail') {
				moveCursor = 1
			} else if (evt.code === 'Space') {
				evt.ctrlKey
					? this.selectMultiItem(this.selection.lastSelectItemIndex)
					: this.selectOneItem(this.selection.lastSelectItemIndex)
			}
			if (moveCursor) {
				this.selection.lastSelectItemIndex += moveCursor
				if (this.selection.lastSelectItemIndex < 0) {
					this.selection.lastSelectItemIndex = 0
				}
				if (this.selection.lastSelectItemIndex >= this.items.length) {
					this.selection.lastSelectItemIndex = this.items.length - 1
				}
				this.selectOneItem(this.selection.lastSelectItemIndex)
			}
		},

		handleFileDrop(evt) {
			evt.preventDefault()
			if (evt.dataTransfer.items.length === 0) {
				return
			}

			const files = []
			for (let i = 0; i < evt.dataTransfer.items.length; i++) {
				let item = evt.dataTransfer.items[i]
				let entry = item.webkitGetAsEntry()
				let file = evt.dataTransfer.files[i]
				if (entry.isDirectory) {
					files.push({
						path: file.path,
						isDir: true
					})
				} else {
					files.push({
						path: file.path,
						isDir: false
					})
				}
			}

			this.$emit('file-drop', files)
		},

		handleSort(key) {
			this.$emit('file-sort', key)
		}
	}
}
</script>

<style lang="scss">
.pt-grid-view {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	user-select: none;
	outline: none;

	.select-rect {
		position: absolute;
		box-sizing: border-box;
		z-index: 1;

		border: 1px solid var(--n-bg-color-base);
		background-color: rgba(0, 0, 0, 0.2);
	}

	.grid-view-header {
		position: absolute;
		left: 0;
		top: 0;

		height: 30px;
		// border-bottom: 1px solid var(--n-bg-color-base);
		box-sizing: border-box;
		z-index: 2;

		color: var(--n-text-color-base);

		background-color: var(--n-bg-color-base);

		.columns {
			display: flex;
			justify-content: flex-start;
			align-items: center;

			margin: 0;
			padding: 0 10px;
			list-style: none;

			.column {
				position: relative;
				display: flex;
				justify-content: space-between;
				align-items: center;
				min-width: 100px;
				height: 30px;
				line-height: 30px;
				list-style: none;
				margin: 0;
				padding: 0 5px;

				&:hover {
					cursor: pointer;
				}
			}

			.resize {
				cursor: col-resize;
			}
		}
	}

	.item-container {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		flex-wrap: wrap;
		margin: 10px;

		&.detail {
			//margin-top: 40px;
		}

		.item-placeholder {
			position: relative;
			width: 100%;
		}
	}
}
</style>
