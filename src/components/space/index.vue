<script lang="jsx">
export default {
	name: 'NSpace',
	props: {
		align: {
			type: String,
			default: 'flex-start'
		},
		vertical: {
			type: Boolean,
			default: false
		},
		size: {
			type: [Number, String],
			default: 8
		},
		wrap: {
			type: Boolean,
			default: false
		},
		itemStyle: {
			type: [Object, Array],
			default: () => {
				return {}
			}
		},
		fill: {
			type: Boolean,
			default: false
		}
	},
	render(createElement) {
		return createElement(
			'div',
			{
				attrs: this.$attrs,
				class: {
					'n-space': true
				},
				style: {
					display: 'inline-flex',
					flexDirection: this.vertical ? 'column' : 'row',
					alignItems: this.vertical ? this.align : 'center',
					justifyContent: this.vertical ? 'space-between' : this.align,
					width: this.fill ? '100%' : 'auto',
					'row-gap': `${this.size}px`,
					'column-gap': `${this.size}px`,
					'flex-wrap': this.wrap ? 'wrap' : 'nowrap',
					'box-sizing': 'border-box'
				}
			},
			this.$slots.default
		)
	}
}
</script>

<style lang="scss" scoped>
.n-space {
	& > * {
		margin: 0 !important;
	}
}
</style>
