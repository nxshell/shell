<template>
	<div id="app" class="main-window mycolor">
		<!--  -->
		<pt-window
			:title="T('app.powertools-shell')"
			:isMainWindow="true"
			:leftPanel="left_pannel"
			:topPanel="top_pannel">
			<div slot="left-panel" class="control-panel">
				<pt-shell-app-nav-bar/>
			</div>
			<template slot="main-panel">
				<keep-alive>
					<router-view/>
				</keep-alive>
			</template>
		</pt-window>
	</div>
</template>

<script>
import {mapState, mapMutations} from 'vuex'

import PtShellAppNavBar from './views/Navbar'
import Lang from '../lang'

import * as globalSetting from './services/globalSetting'
import * as EventBus from './services/eventbus'

let localeName = navigator.language
// let localeName = "en-US";
const defaultLocalName = 'en-US'

async function loadLang(locale) {
	const esModule = await Lang[locale]()
	return esModule.default
}

function getUserConfigLanguage() {
	return globalSetting.getProfile('xterm')?.language ?? null
}

function getUserConfigTheme() {
	return globalSetting.getProfile('xterm')?.theme ?? 'light'
}

export default {
	name: 'App',
	components: {
		PtShellAppNavBar
	},
	data() {
		return {
			left_pannel: true,
			top_pannel: true
		}
	},
	computed: {
		...mapState(['configPanel'])
	},

	async created() {
		window.document.documentElement.setAttribute('nx-theme', getUserConfigTheme() ? getUserConfigTheme() : 'light')

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
				this.left_pannel = false
				this.top_pannel = false
				EventBus.publish('session-config-panel', 'close')
				await document.body.requestFullscreen()
			} catch (e) {
				// pass
			}
		})

		document.addEventListener('fullscreenchange', () => {
			let isfullscreen = !!document.fullscreenElement
			if (!isfullscreen) {
				if (this.configPanel) {
					EventBus.publish('session-config-panel', 'open')
				}
				this.left_pannel = true
				this.top_pannel = true
			}
		})
	}
}
</script>

<style lang="scss">
#app {
	width: 100%;
	height: 100%;
	background-color: var(--lightBackgroundColor);
	//background-image: url("https://images.unsplash.com/photo-1515674744565-0d7112cd179a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80");
	//background-repeat: no-repeat;
	//background-size: 100% 100%;

	.control-panel {
		width: 100%;
		height: 100%;

	}

	.main-window {
		.control-panel {
			background-color: var(--primaryColor);
		}
	}
}
</style>
