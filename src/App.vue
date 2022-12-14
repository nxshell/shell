<template>
	<div id="app" class="main-window mycolor">
		<nx-layout
			:title="T('app.powertools-shell')"
			:isMainWindow="true"
			:leftPanel="left_panel"
			:topPanel="top_panel">
			<template slot="main-panel">
				<keep-alive :exclude="['GlobalSetting']">
					<router-view />
				</keep-alive>
			</template>
		</nx-layout>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import NxLayout from '@/layout/NxLayout'

import Lang from '../lang'

import * as globalSetting from './services/globalSetting'
import * as EventBus from './services/eventbus'

let localeName = navigator.language
const defaultLocalName = 'en-US'

async function loadLang(locale) {
	const esModule = await Lang[locale]()
	return esModule.default
}

function getUserConfigLanguage() {
	return globalSetting.getProfile('xterm')?.language ?? null
}

export default {
	name: 'App',
	components: {
		NxLayout
	},
	data() {
		return {
			left_panel: true,
			top_panel: true
		}
	},
	computed: {
		...mapState(['configPanel'])
	},
	async created() {
		window.document.documentElement.setAttribute('nx-theme', this.$store.getters.theme)

		let _name = getUserConfigLanguage()
		if (_name) {
			localeName = _name
		}
		let lang = await loadLang(localeName)
		if (!lang) {
			localeName = defaultLocalName
			lang = await loadLang(localeName)
		}
		this.locale(localeName, lang)
		this.setLocale(localeName)
		if (process.env.NODE_ENV !== 'development') {
			await this.$router.push({
				name: 'Home'
			})
		}

		EventBus.subscript('enter-fullscreen', async (action) => {
			try {
				this.left_panel = false
				this.top_panel = false
				EventBus.publish('session-config-panel', 'close')
				await document.body.requestFullscreen()
			} catch (e) {
				// pass
			}
		})

		document.addEventListener('fullscreenchange', () => {
			const isFullscreen = !!document.fullscreenElement
			if (!isFullscreen) {
				if (this.configPanel) {
					EventBus.publish('session-config-panel', 'open')
				}
				this.left_panel = true
				this.top_panel = true
			}
		})
	}
}
</script>

<style lang="scss">
#app {
	width: 100%;
	height: 100%;
	background-color: var(--n-bg-color-light);
	//background-image: url("https://i.pinimg.com/originals/8f/22/23/8f2223ad1d71fee35d1bcfa4ea2d570b.jpg");
	//background-repeat: no-repeat;
	//background-size: 100% 100%;

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
