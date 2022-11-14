<template>
	<div class="n-home-empty">
		<div class="n-home-content">
			<span class="n-logo">
				<n-icon name="logo" size="70" />
			</span>
			<p class="n-logo-text">NxShell</p>
		</div>
		<div class="n-home-footer">
			<div class="n-home-footer__feedback">
				<n-space :size="20">
					<el-link :underline="false" @click="toStar">
						<n-icon name="github" />
						Github
					</el-link>
					<el-link :underline="false" @click="toIssues">
						<n-icon name="bug" />
						报告问题
					</el-link>
				</n-space>
			</div>
			<div class="n-home-footer__version">{{ T('home.welcome.software-version') }} {{ version }}</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'NxWelcome',
	data() {
		return {}
	},
	computed: {
		version() {
			return `V${powertools.getVersion()}`
		}
	},
	methods: {
		toStar() {
			const github = 'https://github.com/nxshell/nxshell'
			powertools.openExterUrl(github)
		},
		toIssues() {
			const issues = 'https://github.com/nxshell/nxshell/issues'
			powertools.openExterUrl(issues)
		}
	}
}
</script>

<style lang="scss" scoped>
.n-home-empty {
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	align-items: center;
	width: 100%;
	height: 100%;
	// background-color: var(--n-bg-color-base);
	.n-home-content {
		flex: 1 0 0;
		display: flex;
		justify-content: center;
		align-items: center;
		.n-logo {
			display: inline-block;
			width: 80px;
			height: 80px;
			box-sizing: border-box;
			z-index: 0;
			&::before {
				position: absolute;
				content: '';
				width: 65px;
				height: 60px;
				background: #000;
				transform: translate(-35px, 25px) scaleY(0.5) skew(50deg);
				z-index: -1;
				filter: blur(5px);
				mask-image: linear-gradient(transparent, #000);
				-webkit-mask-image: linear-gradient(transparent, #000);
			}
		}
		.n-logo-text {
			margin-left: 60px;
			font-size: 80px;
			font-weight: 700;
			color: #132847;
			z-index: 0;
			&::before {
				position: absolute;
				content: 'NxShell';
				color: #000;
				transform: translate(-35px, 15px) scaleY(0.5) skew(50deg);
				z-index: -1;
				filter: blur(3px);
				mask-image: linear-gradient(transparent, #000);
				-webkit-mask-image: linear-gradient(transparent, #000);
			}
		}
	}

	.n-home-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 40px;
		padding: 5px 15px;
		box-sizing: border-box;
		background-color: var(--n-bg-color-base);
		color: var(--n-text-color-base);
	}
}
</style>
