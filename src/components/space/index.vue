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
		itemStyle: {
			type: [Object, Array],
			default: () => {
				return {}
			}
		}
	},
	render(createElement) {
		const vnodeList = this.$slots.default.map((x) => {
			return createElement(
				'div',
				{
					style: {
						display: 'inline-block',
						[this.vertical ? 'margin-bottom' : 'margin-right']: `${ this.size }px`,
						...this.itemStyle
					}
				},
				[x]
			)
		})

		return createElement(
			'div',
			{
				class: {
					space: true
				},
				style: {
					flexDirection: this.vertical ? 'column' : 'row',
					alignItems: this.vertical ? this.align : 'center',
					justifyContent: this.vertical ? 'space-between' : this.align
				}
			},
			vnodeList
		)
	}
}
</script>
<style lang="scss" scoped>
.space {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: nowrap;

	& :last-child {
		margin-right: 0 !important;
	}
}
</style>
