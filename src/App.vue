<template>
	<div id="app" class="main-window">
		<nx-layout>
			<template slot="main-panel">
				<router-view />
			</template>
		</nx-layout>
	</div>
</template>

<script setup>
import NxLayout from '@/layout/NxLayout.vue'
import { useSettingStore } from '@/store'
import { storeToRefs } from 'pinia'
import { getCurrentInstance, onMounted } from 'vue'
import { useRouter } from 'vue-router/composables'

const settingStore = useSettingStore()
const { theme } = storeToRefs(settingStore)
const router = useRouter()
const instance = getCurrentInstance()
onMounted(() => {
	settingStore.changeTheme(theme.value)
	const proxy = instance?.proxy
	if (process.env.NODE_ENV !== 'development') {
		router.push({ name: 'Home' })
	}
})
</script>

<style lang="scss">
#app {
	width: 100%;
	height: 100%;
	background-color: var(--n-bg-color-light);

	.control-panel {
		width: 100%;
		height: 100%;
	}

	.main-window {
		.control-panel {
			background-color: var(--n-bg-color-light);
		}
	}
}
</style>
