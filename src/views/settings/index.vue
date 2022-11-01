<template>
	<div class="n-setting-wrapper">
		<nx-terminal-form />
	</div>
</template>

<script lang="js">
import NxTerminalForm from './components/terminal-form'

export default {
	name: 'NxSettings',
	components: { NxTerminalForm },
	data() {
		return {}
	}
}
</script>

<style lang="scss" scoped>
.n-setting-wrapper {
	height: 100%;
	background-color: var(--n-bg-color-base);
}
</style>