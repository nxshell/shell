<template>
	<div
		class="pt-menu-item"
		:class="{'pt-menu-separator': item.type === 'separator'}"
		@mouseenter="handleMouseEnter"
		@mousedown="handleClick"
	>
		<el-popover
			v-if="item.type === 'submenu'"
			placement="right"
			trigger="hover"
			:visible-arrow="true"
			popper-class="nx-content-submenu"
		>
			<pt-menu :menu="item.submenu" :translate="true" @pop-stack="showSubmenu = false" ref="submenu" />
			<div class="pt-menu-item-container" slot="reference">
				<span class="item-icon"><!--占位--></span>
				<span class="item-label">{{ translate ? $t(label) : label }}</span>
				<span class="item-accelerator">{{ accelerator }}</span>
				<n-icon name="arrow-right" size="18" className="item-submenu-arrow" />
			</div>
		</el-popover>
		<div v-else-if="item.type === 'normal'" class="pt-menu-item-container">
			<span class="item-icon"><!--占位--></span>
			<span class="item-label">{{ translate ? $t(label) : label }}</span>
			<span class="item-accelerator">{{ accelerator }}</span>
			<span class="item-submenu-arrow"><!--占位--></span>
		</div>
	</div>
</template>

<script>
import { popMenu, pushMenu } from "./menuManager";

export default {
	name: "PtMenuItem",
	props: {
		/**
		 * item
		 * {
		 *     icon: ""
		 *     type: "normal", "submenu", "separator"
		 *     role: "",
		 *     accelerator: '',
		 *     label: '',
		 *     handler: Function
		 *     submenu: []
		 * }
		 */
		item: {
			type: Object
		},
		translate: {
			type: Boolean,
			default: false
		},
	},

	data() {
		return {
			showSubmenu: false
		};
	},

	computed: {
		label() {
			const { item } = this;
			if (item.label) {
				return item.label;
			}
			return "";
		},
		accelerator() {
			const { item } = this;
			if (!item.accelerator) {
				return "";
			}

			return item.accelerator.split("+").map((key) => {
				key = key.trim().toLowerCase();
				return key[0].toUpperCase() + key.substr(1)
			}).join("+");
		}
	},

	methods: {
		handleMouseEnter() {
			popMenu(this.$parent);
			if (this.item.submenu && this.item.submenu.length) {
				pushMenu(this.$refs.submenu);
				this.showSubmenu = true;
			}
		},

		handleClick() {
			if (typeof this.item.handler === 'function') {
				this.item.handler();
			}
		}
	}
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_const.scss";

.nx-content-submenu {
	left: 100px;
	padding: 0 !important;
}

.pt-menu-item {
	position: relative;
	height: $menuItemHeight;
	line-height: $menuItemHeight;
	padding: 5px 5px 0 5px;

	&.pt-menu-separator {
		height: 1px !important;
		line-height: 1px !important;

		hr {
			border: none;
			height: 1px;
			background-color: var(--n-bg-color-base);
		}
	}

	.pt-menu-item-container {
		display: flex;
		align-items: center;

		&:hover {
			cursor: pointer;
			border-radius: 4px;
			background-color: var(--n-hover-bg-color);
		}

		.item-icon {
			display: inline-block;
			width: 16px;
			height: 16px;
			flex-shrink: 0;
		}

		.item-label {
			display: inline-block;
			flex-grow: 1;
			text-align: left;
			color: var(--n-text-color-base);
		}

		.item-accelerator {
			display: inline-block;
			flex-grow: 1;
			text-align: right;
			color: var(--n-text-color-base);
		}

		.item-submenu-arrow {
			display: inline-block;
			width: 16px;
			height: 16px;
			flex-shrink: 0;
			color: var(--n-text-color-base);
		}
	}
}
</style>
