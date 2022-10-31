<template>
	<div class="pt-menu">
		<pt-menu-item v-for="(item, idx) in menu" :key="idx" :item="item" :translate="translate" />
	</div>
</template>

<script>
import { getLastMenuId, pushMenu } from "./menuManager";

export default {
	name: "PtMenu",
	props: {
		menu: {
			type: Array,
			required: true
		},
		translate: {
			type: Boolean,
			default: true
		},
		parent: Object
	},

	data() {
		return {
			id: getLastMenuId()
		}
	},

	created() {
		pushMenu(this);
	}
}
</script>

<style lang="scss">
@import "../../assets/scss/_const.scss";

.pt-menu {
	position: relative;
	z-index: $menuZIndex;
	min-width: 180px;
	padding: {
		top: 5px;
		bottom: 5px;
	}
	border-radius: 4px;
	background-color: var(--n-color-modal);
	box-shadow: 2px 2px 30px 1px rgba(0, 0, 0, .2);
}
</style>