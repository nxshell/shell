<template>
	<div
		class="pt-menu-item"
		:class="{'pt-menu-separator': item.type === 'separator'}"
		@mouseenter="handleMouseEnter"
		@mousedown="handleClick"
	>
		<pt-popper
			v-if="item.type === 'submenu'"
			position="right-top"
			class="nx-content-submenu"
			:show="showSubmenu"
			:zIndex="10000"
		>
			<pt-menu :menu="item.submenu" @pop-stack="showSubmenu = false" ref="submenu" />
			<template slot="reference">
				<div class="pt-menu-item-container">
					<span class="item-icon"><!--占位--></span>
					<span class="item-label">{{ translate ? T(label) : label }}</span>
					<span class="item-accelerator">{{ accelerator }}</span>
					<pt-icon iconName="arrow-right" size="small" className="item-submenu-arrow" />
				</div>
			</template>
		</pt-popper>
		<div v-else-if="item.type === 'normal'" class="pt-menu-item-container">
			<span class="item-icon"><!--占位--></span>
			<span class="item-label">{{ translate ? T(label) : label }}</span>
			<span class="item-accelerator">{{ accelerator }}</span>
			<span class="item-submenu-arrow"><!--占位--></span>
		</div>
		<hr v-else class="pt-menu-item-container" />
	</div>
</template>

<script>
import PtPopper from "../base/popper";
import { popMenu, pushMenu } from "./menuManager";

export default {
	name: "PtMenuItem",
	components: {
		PtPopper
	},
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

<style lang="scss">
@import "@/assets/scss/_const.scss";

.nx-content-submenu {
	left: 100px;
}

.pt-menu-item {
	position: relative;
	height: $menuItemHeight;
	line-height: $menuItemHeight;
	padding: 0 5px 5px;

	&.pt-menu-separator {
		height: 1px !important;
		line-height: 1px !important;

		hr {
			border: none;
			height: 1px;
			background-color: var(--borderColor);
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
			color: var(--secondaryTextColor);
		}

		.item-submenu-arrow {
			display: inline-block;
			width: 16px;
			height: 16px;
			flex-shrink: 0;
			color: var(--secondaryTextColor);
		}
	}
}
</style>
