<template>
	<div class="n-icon-button" v-bind="$attrs" v-on="$listeners">
		<n-icon v-if="icon" :name="icon" :size="size" />
		<i v-if="elIcon" :class="elIcon" :style="{ fontSize: `calc(${size} * 1px)` }" />
		<slot v-if="$slots.default"></slot>
		<div v-if="!$slots.default && label" class="n-icon-button__label">{{ t(label) }}</div>
	</div>
</template>

<script>
export default {
	name: "NxButton"
}
</script>

<script setup>
import { useI18n } from "vue-i18n-bridge"

const props = defineProps({
	// Icon name
	icon: {
		type: String,
		default: ""
	},
	elIcon: {
		type: String,
		default: ""
	},
	size: {
		type: Number,
		default: 18
	},
	gap: {
		type: Number,
		default: 5
	},
	label: {
		type: String,
		default: ""
	},
	labelAlign: {
		type: String,
		default: "center"
	}
})
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.n-icon-button {
	display: flex;
	justify-content: space-between;
	align-items: v-bind(labelAlign);
	column-gap: calc(v-bind(gap) * 1px);
	font-size: calc(v-bind(size) / 3 * 2px);
	padding: 5px;

	&:hover {
		cursor: pointer;
		border-radius: 4px;
		background-color: var(--n-hover-bg-color);
	}
}
</style>
