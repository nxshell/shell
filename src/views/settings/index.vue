<template>
	<div class="n-setting-wrapper">
		<div class="n-setting-header">
			<h1>全局设置</h1>
			<p>此处设置作为所有终端默认设置</p>
		</div>
		<nx-terminal-form />
	</div>
</template>

<script lang="js">
import NxTerminalForm from './components/terminalForm'

export default {
	name: 'NxSettings',
	components: { NxTerminalForm },
	data() {
		return {}
	},
	created() {
	},
	methods: {}
}
</script>

<style lang="scss" scoped>
.n-setting-wrapper {
	height: 100%;
	padding: 15px;
	background-color: var(--n-bg-color-base);

	.n-setting-header {
		padding: 10px 0;
		color: var(--n-text-color-base);
	}
}
</style>
