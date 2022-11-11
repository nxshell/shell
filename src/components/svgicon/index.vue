<template>
	<div v-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-on="$listeners" />
	<svg
		v-else-if="type === 'svg'"
		class="svg-icon"
		:class="className"
		:width="iconSize"
		:height="iconSize"
		aria-hidden="true"
		v-on="$listeners"
	>
		<use :xlink:href="iconName" />
	</svg>
	<img
		v-else
		class="n-icon-img"
		:src="name"
		:class="className"
		:width="iconSize"
		:height="iconSize"
		aria-hidden="true"
		alt="img"
		v-on="$listeners"
	/>
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
		type: {
			type: String,
			default: () => 'svg'
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
	watch: {
		size(n, o) {
			if (typeof n === 'string') {
			}
		}
	},
	computed: {
		isExternal() {
			// return isExternal(this.name)
			return false
		},
		iconName() {
			return `#icon-${this.name}`
		},
		iconSize() {
			switch (this.size) {
				case 'mini':
					return 12
				case 'small':
					return 18
				case 'middle':
					return 24
				case 'large':
					return 32
				case 'huge':
					return 128
				default:
					try {
						return parseInt(this.size)
					} catch (error) {
						return 18
					}
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

.n-icon-img {
	vertical-align: middle;
}
</style>
