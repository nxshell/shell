<template>
	<div class="n-icon-button" v-bind="$attrs" v-on="$listeners">
		<n-icon v-if="icon" :name="icon" :size="size" />
		<slot v-if="$slots.default"></slot>
		<div v-else class="n-icon-button__label">{{ t(label) }}</div>
	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n-bridge"

const props = defineProps({
	// Icon name
	icon: {
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

	&:hover {
		cursor: pointer;
	}
}
</style>
