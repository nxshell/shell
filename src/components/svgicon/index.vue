<template>
	<div v-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-on="$listeners" />
	<svg v-else :class="svgClass" :width="size" :height="size" aria-hidden="true" v-on="$listeners">
		<use :xlink:href="iconName" />
	</svg>
</template>

<script>
// doc: https://panjiachen.github.io/vue-element-admin-site/feature/component/svg-icon.html#usage
// import {isExternal} from '@/utils/validate'
export default {
	name: 'NIcon',
	props: {
		name: {
			type: String,
			required: true
		},
		className: {
			type: String,
			default: ''
		},
		size: {
			type: [Number, String],
			default: 18
		}
	},
	computed: {
		isExternal() {
			// return isExternal(this.name)
		},
		iconName() {
			return `#icon-${this.name}`
		},
		svgClass() {
			if (this.className) {
				return 'svg-icon ' + this.className
			} else {
				return 'svg-icon'
			}
		},
		styleExternalIcon() {
			return {
				mask: `url(${this.name}) no-repeat 50% 50%`,
				'-webkit-mask': `url(${this.name}) no-repeat 50% 50%`,
				width: `${this.size}px`,
				height: `${this.size}px`
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.svg-icon {
	vertical-align: -0.15em;
	fill: currentColor;
	overflow: hidden;
	cursor: pointer;
}
.svg-external-icon {
	background-color: currentColor;
	mask-size: cover !important;
	display: inline-block;
}
</style>
