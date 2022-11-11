<template>
	<div class="pt-grid-view-item" :style="itemStyle" :class="mode" @mousedown.stop @contextmenu="handleContextMenu">
		<div class="pt-grid-view-item-container" :class="{selected: selected}" @click="selectItem" @dblclick="openItem">
			<template v-if="!showExtFields">
				<n-icon v-if="value.icon" :name="value.icon" :type="value.iconType || 'svg'" :size="iconSize" />
				<span class="name">{{ value.name }}</span>
			</template>
			<template v-if="showExtFields">
				<template v-if="mode === 'detail'">
					<div
						class="detail-name-field"
						:style="{
							width: columns[0].width + 'px',
							minWidth: columns[0].minWidth + 'px'
						}"
					>
						<n-space>
							<n-icon :name="value.icon" :size="iconSize" :type="value.iconType || 'svg'" />
							<span class="name" :class="{normal: !selected, selected}" :title="value.name">
								{{ value.name }}
							</span>
						</n-space>
					</div>
					<span
						v-for="(field, idx) in extFields"
						:key="value.name + idx"
						class="ext-fields"
						:style="{
							width: columns[idx + 1].width + 'px',
							minWidth: columns[idx + 1].minWidth + 'px',
							textAlign: columns[idx + 1].align
						}"
					>
						{{ field.fieldValue }}
					</span>
				</template>
				<template v-if="mode == 'tile'">
					<n-icon :name="value.icon" :size="iconSize" :type="value.iconType || 'svg'" />
					<div class="tile-fields">
						<span>{{ value.name }}</span>
						<span v-for="(field, idx) in extFields" :key="value.name + idx" class="ext-fields">
							{{ field.fieldValue }}
						</span>
					</div>
				</template>
			</template>
		</div>
	</div>
</template>

<script>
export default {
	name: 'PtGridViewItem',
	props: {
		mode: String,
		columns: Array,
		width: Number,
		height: Number,
		colSpaceSize: Number,
		rowSpaceSize: Number,
		selected: Boolean,
		value: Object
	},

	computed: {
		itemStyle() {
			return {
				width: this.width < 0 ? '100%' : this.width + 'px',
				height: this.height + 'px',
				marginRight: this.width < 0 ? 0 : this.colSpaceSize + 'px',
				marginBottom: this.rowSpaceSize + 'px'
			}
		},

		extFields() {
			// return Object.keys(this.value).map((fieldName) => {
			//     if (fieldName == "icon" || fieldName == "name") {
			//         return;
			//     }
			//     return {
			//         fieldName,
			//         fieldValue: this.value[fieldName]
			//     };
			// }).filter(x => x);
			return this.columns
				.map((col) => {
					if (col.dataKey === 'name') {
						return
					}

					return {
						fieldName: col.dataKey,
						fieldValue: this.value[col.dataKey]
					}
				})
				.filter((x) => x)
		},

		showExtFields() {
			return {
				detail: true,
				small: false,
				medium: false,
				large: false,
				huge: false,
				tile: true
			}[this.mode]
		},

		iconSize() {
			return {
				detail: 'small',
				small: 'small',
				medium: 'medium',
				large: 'large',
				huge: 'huge',
				tile: 'large'
			}[this.mode]
		}
	},

	methods: {
		/**
		 * @param {MouseEvent} evt 鼠标单击事件
		 */
		selectItem(evt) {
			let selectType = 'normal'
			if (evt.ctrlKey) {
				selectType = 'multi'
			} else if (evt.shiftKey) {
				selectType = 'serial'
			}

			this.$emit('select', {
				type: selectType
			})
		},

		openItem() {
			this.$emit('open')
		},

		handleContextMenu() {
			this.$emit('select', {
				type: 'contextmenu'
			})
			this.$emit('contextmenu')
		}
	}
}
</script>

<style lang="scss">
.pt-grid-view-item {
	position: relative;
	color: var(--n-text-color-base);
	box-sizing: border-box;

	.pt-grid-view-item-container {
		display: flex;
		box-sizing: border-box;
		justify-content: flex-start;
		align-items: center;

		font-size: 13px;

		border: 1px solid transparent;

		&:hover {
			border: 1px solid var(--n-hover-bg-color);
			background-color: var(--n-hover-bg-color);
		}

		&.selected {
			border: 1px solid var(--n-hover-bg-color);
			background-color: var(--n-hover-bg-color);
		}

		.detail-name-field {
			display: flex;
			align-items: center;
			padding: 0 5px;
		}

		.ext-fields {
			display: inline-block;
			padding: 0 5px;
			color: var(--n-text-color-base);
		}

		.tile-fields {
			display: flex;
			justify-content: center;
			align-items: flex-start;
			flex-direction: column;
		}
	}

	&.detail {
		.name {
			&.normal {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			&.selected {
				position: relative;
				z-index: 1;
			}
		}
	}

	&.medium,
	&.large,
	&.huge {
		.pt-grid-view-item-container {
			flex-direction: column;
		}

		.name {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			text-align: center;
			width: 100%;
			max-height: 50px;
			white-space: pre-wrap;
			-webkit-line-clamp: 3;
			overflow: hidden;
			text-overflow: ellipsis;
			word-break: break-all;
		}
	}
}
</style>
