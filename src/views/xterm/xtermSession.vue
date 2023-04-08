<template>
	<div class="pt-xterm-session">
		<div ref="xtermContainerRef" class="xterm-container">
			<xterm-instance
				v-for="(sessionId, idx) in sessions"
				:key="sessionId"
				v-show="visible(sessionId)"
				:sessionInstanceId="sessionId"
				:style="xtermStyle"
				class="xterm-wrapper"
				@split_screen="(type) => settingStore.updateLayoutMode(type)"
				@titleChange="handleTitleChange"
				@remove-session="handleRemoveSession(idx)"
			/>
		</div>
	</div>
</template>

<script setup>
import XtermInstance from './xtermInstance'
import { useSettingStore } from '@/store'
import { computed, getCurrentInstance, nextTick, onActivated, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteUpdate, useRoute } from 'vue-router/composables'
import { useI18n } from 'vue-i18n-bridge'

const { t } = useI18n()
const xtermContainerRef = ref()
const sessions = ref([])
const currentSessionId = ref(-1)
const sessionIdMapSftpDir = ref({})
const tunnelMapTitle = ref({})
const settingStore = useSettingStore()
const { layoutMode } = storeToRefs(settingStore)
const proxy = getCurrentInstance().proxy
const initWidth = ref(0)
const visible = (sessionId) => (layoutMode.value === 'normal' ? currentSessionId.value === sessionId : true)
const xtermStyle = computed(() => {
	let width = '100%'
	let height = '100%'
	let min_width = 200
	let t_len = sessions.value.length
	let f_len = Math.floor((t_len + 1) / 2)

	if (layoutMode.value === 'grid') {
		if (t_len < 3) {
			height = '100%'
			width = Math.floor(100 / t_len)
			width = width + '%'
		} else {
			height = '50%'
			width = Math.floor(100 / f_len)
			width = width + '%'
			min_width = Math.floor(initWidth.value / f_len)
		}
	} else if (layoutMode.value === 'col') {
		height = '100%'
		width = Math.floor(100 / t_len)
		width = width + '%'
		min_width = Math.floor(initWidth.value / t_len)
	} else if (layoutMode.value === 'row') {
		width = '100%'
		height = Math.floor(100 / t_len)
		height = height + '%'
	}

	return {
		width,
		height,
		'min-width': `${min_width}px`
	}
})

const handleTitleChange = ({ sessionId, title }) => (sessionIdMapSftpDir[sessionId] = title)
const handleRemoveSession = (idx) => sessions.value.splice(idx, 1)
const addSession = (sessionId) => {
	if (sessions.value.findIndex((v) => v === sessionId) > -1) {
		return
	}
	sessions.value.push(sessionId)
}
onBeforeRouteUpdate((to, from, next) => {
	if (to.path !== from.path) {
		currentSessionId.value = parseInt(to.params.sessionId)
		addSession(currentSessionId.value)
		if (!tunnelMapTitle.value[currentSessionId.value]) {
			tunnelMapTitle.value[currentSessionId.value] = t('home.session-instance.tunnel')
		}
	}
	next()
})

const route = useRoute()
onActivated(() => {
	currentSessionId.value = parseInt(route.params.sessionId)
	addSession(currentSessionId.value)
	if (!tunnelMapTitle.value[currentSessionId.value]) {
		tunnelMapTitle.value[currentSessionId.value] = t('home.session-instance.tunnel')
	}
})

onMounted(() => {
	nextTick(() => (initWidth.valu = xtermContainerRef.value.clientWidth))
})
</script>

<style lang="scss" scoped>
.pt-xterm-session {
	position: relative;

	width: 100%;
	height: 100%;

	.pt-icon {
		// margin-left: 5px;
		// margin-right: 5px;
		color: var(--secondaryTextColor);
		transition: color 0.2s;

		&:hover {
			color: var(--n-text-color-base);
			transition: color 0.2s;
		}
	}

	.xterm-container {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		height: 100%;
		overflow: hidden;

		.xterm-wrapper {
			flex-grow: 1;
		}
	}
}
</style>
