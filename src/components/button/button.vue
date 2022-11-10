<template>
	<button type="button" class="pt-button" :class="classList" @click="onClick" :title="title" :autofocus="focus">
		<pt-icon v-if="icon" :iconName="icon" />
		<slot />
	</button>
</template>

<script>
export default {
	name: 'PtButton',
	props: {
		type: {
			type: String,
			default: 'default'
		},

		className: {
			type: String,
			default: ''
		},

		circle: {
			type: Boolean
		},

		icon: {
			type: String
		},

		round: {
			type: Boolean
		},

		size: {
			type: String
		},

		plain: {
			type: Boolean
		},

		title: {
			type: String
		},

		focus: {
			type: Boolean
		}
	},

	computed: {
		classList() {
			let classList = [`pt-button--${this.type}`]
			if (this.circle) {
				classList.push('pt-button--circle')
			}
			if (this.round) {
				classList.push('pt-button--round')
			}
			if (this.size) {
				classList.push(`pt-button--${this.size}`)
			}
			if (this.plain) {
				classList.push(`plain`)
			}
			if (this.className) {
				classList.push(this.className)
			}

			return classList
		}
	},

	mounted() {
		if (this.focus) {
			console.log('focus')
			this.$nextTick(() => {
				this.$el.focus()
			})
		}
	},

	methods: {
		onClick(e) {
			this.$emit('click', e)
		}
	}
}
</script>

<style lang="scss">
.pt-button {
	padding: {
		left: 15px;
		right: 15px;
	}
	border-radius: 2px;
	box-sizing: content-box;
	outline: none;
	height: 40px;
	min-width: 80px;
	&.pt-button--round {
		border-radius: 20px;
	}

	@mixin pt-button-type-normal($bgColor, $hoverColor, $foreColor) {
		border: solid 1px $bgColor;
		background-color: $bgColor;
		color: $foreColor;
		transition: all 0.2s;
		&:hover {
			border: solid 1px $hoverColor;
			background-color: $hoverColor;
			transition: all 0.2s;
		}
	}

	@mixin pt-button-plain($bgColor, $color) {
		border: solid 1px $bgColor;
		background-color: $bgColor;
		color: $color;
		transition: all 0.2s;
		&:hover {
			background-color: $bgColor;
			color: $color;
			opacity: 0.7;
			transition: all 0.2s;
		}
	}
	/** 类型 */
	&.pt-button--primary {
		@include pt-button-type-normal(var(--btnPrimaryBackgroundColor), var(--btnPrimaryHoverBackgroundColor), white);
		&.plain {
			@include pt-button-plain(var(--btnPrimaryBackgroundColor), var(--btnPrimaryPlainColor));
		}
	}
	&.pt-button--success {
		@include pt-button-type-normal(var(--btnSuccessBackgroundColor), var(--btnSuccessHoverBackgroundColor), white);
		&.plain {
			@include pt-button-plain(var(--btnSuccessPlainBackgroundColor), var(--btnSuccessPlainColor));
		}
	}
	&.pt-button--info {
		@include pt-button-type-normal(var(--btnInfoBackgroundColor), var(--btnInfoHoverBackgroundColor), white);
		&.plain {
			@include pt-button-plain(var(--btnInfoPlainBackgroundColor), var(--btnInfoPlainColor));
		}
	}
	&.pt-button--warning {
		@include pt-button-type-normal(var(--btnWarningBackgroundColor), var(--btnWarningHoverBackgroundColor), white);
		&.plain {
			@include pt-button-plain(var(--btnWarningPlainBackgroundColor), var(--btnWarningPlainColor));
		}
	}
	&.pt-button--danger {
		@include pt-button-type-normal(var(--btnDangerBackgroundColor), var(--btnDangerHoverBackgroundColor), white);
		&.plain {
			@include pt-button-plain(var(--btnDangerPlainBackgroundColor), var(--btnDangerPlainColor));
		}
	}

	/** 大小  */
	&.pt-button--default {
		border: solid 1px var(--borderColor);
		background-color: var(--n-bg-color-base);
		color: var(--n-text-color-base);
		transition: all 0.2s;
		&:hover {
			border: solid 1px var(--n-button-primary);
			background-color: var(--n-button-primary);
			color: var(--n-button-primary-text);
			transition: all 0.2s;
		}
	}

	&.pt-button--medium {
		height: 35px;
		&.pt-button--round {
			border-radius: 17.5px;
		}
	}

	&.pt-button--small {
		height: 32px;
		&.pt-button--round {
			border-radius: 16px;
		}
	}

	&.pt-button--mini {
		height: 28px;
		&.pt-button--round {
			border-radius: 14px;
		}
	}

	/** 形状 */
	&.pt-button--circle {
		padding: 0;
		border-radius: 50%;
		width: 40px;
		min-width: 40px;
		height: 40px;
		line-height: 40px;
		text-align: center;
	}
}
</style>
