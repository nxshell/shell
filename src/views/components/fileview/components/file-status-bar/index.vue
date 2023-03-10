<template>
	<div class="n-file-status-bar-wrapper">
		<div class="n-progress-graph-line-rail" :style="{width: progressWidth}" />
		<div v-if="!showProgress" class="status-bar-item">
			{{
				selectedLength > 0
					? $t('home.fileview.mainview.total-selected-count', fileTotal, selectedLength)
					: $t('home.fileview.mainview.total-file-count', fileTotal)
			}}
		</div>
		<div v-if="showProgress" class="status-bar-item">
			<span class="status-description">{{ progressDesc }}</span>
		</div>
		<div v-if="showProgress" class="status-bar-item progress-status" style="flex: 1">
			<n-space :size="10">
				<span class="n-progress-text">{{ progress }}%</span>
				<el-divider v-if="speed" direction="vertical" />
				<span v-if="speed" class="n-progress-speed">{{ speed }}</span>
			</n-space>
		</div>
	</div>
</template>

<script>
export default {
	name: 'FileStatusBar',
	props: {
		showProgress: {
			type: Boolean,
			default: false
		},
		fileTotal: {
			type: Number,
			default: 0
		},
		selectedLength: {
			type: Number,
			default: 0
		},
		progressDesc: {
			type: String,
			default: ''
		},
		progress: {
			type: Number,
			default: 50
		},
		speed: {
			type: [Number, String],
			default: 0
		}
	},
	data() {
		return {}
	},
	computed: {
		progressWidth() {
			return `${this.progress}%`
		}
	},
	methods: {
		formatProgress() {
			return `${this.progress}% ${this.speed}`
		}
	}
}
</script>

<style lang="scss" scoped>
@keyframes animate-shine {
	0% {
		opacity: 0;
		width: 0;
	}

	50% {
		opacity: 0.5;
	}

	100% {
		opacity: 0;
		width: 98%;
	}
}

.n-file-status-bar-wrapper {
	position: absolute;
	bottom: 0;
	left: 0;
	min-width: 790px;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	width: 100%;
	height: 30px;
	box-sizing: border-box;
	padding: 4px 10px;
	backdrop-filter: blur(20px);
	background-color: var(--n-bg-color-light);

	.n-progress-graph-line-rail {
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
		content: '';
		height: 80%;
		z-index: -1;
		background-color: var(--n-progress-bar-color);

		&::before {
			content: '';
			opacity: 0;
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			background: #fff;
			border-radius: 3px;
			animation: animate-shine 2s ease-out infinite;
		}
	}

	.status-bar-item {
		margin-right: 10px;
		color: var(--n-text-color-base);

		.n-progress-text {
			display: inline-block;
			width: 30px;
			height: 100%;
			text-align: right;
		}

		.n-progress-speed {
			display: inline-block;
			height: 100%;
			width: 100px;
		}

		::v-deep .el-progress {
			&-bar {
				&__outer,
				&__inner {
					border-radius: 0 !important;
				}
			}

			&__text {
				font-size: 14px !important;
				color: #000;
			}
		}
	}

	.progress-status {
		flex: 1;
		display: flex;
		justify-content: flex-end;
		align-self: center;
	}
}
</style>
