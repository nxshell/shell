<template>
	<div class="pt-tab-item" @contextmenu.prevent="handleContextMenu">
		<el-tag
			v-bind="$attrs"
			:class="{ 'pt-tab-item--selected': selected }"
			@click="onClickHandler"
			@close="onCloseHandler">
			<n-icon size="18" :name="iconProp.iconName" :type="iconProp.type" />
			{{ title }}
		</el-tag>
	</div>
</template>

<script>
export default {
	name: 'PtTabItem',
	props: {
		icon: {
			type: [String, Object]
		},

		title: {
			type: String
		},

		selected: {
			type: Boolean
		},
		showSplit: {
			type: Boolean
		},
		hideClose: {
			type: Boolean
		}
	},

	computed: {
		iconProp() {
			if (!this.icon) {
				return null
			}

			if (typeof this.icon === 'string') {
				return {
					iconName: this.icon,
					type: 'svg'
				}
			}
			if (typeof this.icon === 'object') {
				const iconProp = { ...this.icon }
				if (iconProp.type !== 'img') {
					iconProp.type = 'svg'
				}
				return iconProp
			}
		}
	},

	methods: {
		onClickHandler() {
			this.$emit('click')
		},

		onCloseHandler() {
			this.$emit('close')
		},
		handleContextMenu() {
			this.$emit('contextmenu')
		}
	}
}
</script>

<style lang="scss" scoped>
.pt-tab-item {
	display: inline-block;
	height: 30px;
	user-select: none;
	transition: all 0.2s;

	::v-deep .el-tag {
		width: 100%;
		height: 100%;
		line-height: 30px;
		border: none;
		border-radius: 0;
		color: var(--n-text-color-base);
		background-color: var(--n-tabs-item-bg-color);

		&.pt-tab-item--selected {
			background-color: var(--n-tabs-item-active);
			border-color: var(--n-tabs-item-active);
			color: var(--n-text-color-base);
			transition: all 0.2s;
		}

		i {
			color: var(--n-text-color-base);

			&:hover {
				color: var(--n-button-primary-text);
				background-color: transparent;
			}
		}

		&:hover {
			cursor: pointer;
			color: var(--n-text-color-base);
			background-color: var(--n-tabs-item-hover-bg-color);
			transition: all 0.2s;
		}
	}
}
</style>
