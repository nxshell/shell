<template>
	<el-tag
		class="pt-tab-item"
		:class="{ 'pt-tab-item--selected': selected }"
		closable
		@click="onClickHandler"
		@contextmenu.prevent="handleContextMenu"
		@close="onCloseHandler">
		<span v-if="icon" class="pt-tab-item-icon">
			<pt-icon size="custom" :customSize="18" :iconName="iconProp.iconName" :type="iconProp.type" />
		</span>
		{{ title }}
	</el-tag>
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
				const iconProp = {...this.icon}
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
	height: 30px;
	line-height: 30px;
	border: none;
	color: var(--n-text-color-base);
	background-color: var(--n-tabs-item-bg-color);
	user-select: none;
	transition: all 0.2s;

	::v-deep i {
		color: var(--deactiveTextColor);

		&:hover {
			background-color: transparent;
		}
	}

	&:hover {
		cursor: pointer;
		color: var(--n-text-color-base);
		background-color: var(--n-tabs-item-hover-bg-color);
		transition: all 0.2s;
	}

	&.pt-tab-item--selected {
		background-color: var(--n-tabs-item-hover-bg-color);
		border-color: var(--n-tabs-item-hover-bg-color);
		color: var(--n-text-color-base);
		transition: all 0.2s;
	}
}
</style>
