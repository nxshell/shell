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
            <keep-alive slot="main-panel">
                <router-view/>
            </keep-alive>
        </pt-window>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

import PtShellAppNavBar from "./views/Navbar";
import Lang from "../lang";

import * as globalSetting from "./services/globalSetting";
import * as EventBus from "./services/eventbus";

	let localeName = navigator.language
	// let localeName = "en-US";
	const defaultLocalName = 'en-US'

async function loadLang(locale) {
    const esModule = await Lang[locale]();
    return esModule.default;
}

function getUserConfigLanguage() {
    let ret = globalSetting.getProfile("xterm");
    if (ret && ret.language) {
        return ret.language;
    } else {
        return null;
    }
}

function getUserConfigTheme() {
    let ret = globalSetting.getProfile("xterm");
    if (ret && ret.theme) {
        return ret.theme;
    } else {
        return "dark";
    }
}

export default {
    name: "App",
    components: {
        PtShellAppNavBar
    },
    data() {
        return {
            left_pannel: true,
            top_pannel: true,
        }
    },
    computed: {
        ...mapState(["configPannel"]),
    },

    async created() {
        let _theme = getUserConfigTheme();
			if (_theme === 'light') {
				window.document.documentElement.setAttribute('nx-theme', 'light')
			} else {
				window.document.documentElement.setAttribute('nx-theme', 'dark')
			}
        this.setTheme(_theme);
        let _name =  getUserConfigLanguage();
        if(_name) {
            localeName = _name;
        }
        let lang = await loadLang(localeName);
        if (!lang) {
            localeName = defaultLocalName;
            lang = await loadLang(localeName);
        }
        this.locale(localeName, lang);
        this.setLocale(localeName);
        if (process.env.NODE_ENV != "development") {
            this.$router.push({
                name: "Home"
            });
        }
        console.log(process.env.NODE_ENV);

        EventBus.subscript("enter-fullscreen", async (action)=> {
            try {
                this.left_pannel = false;
                this.top_pannel = false;
                EventBus.publish("session-config-pannel", "close")
                await document.body.requestFullscreen();
            }catch(e) {
                // pass
            }
        })
                
        document.addEventListener("fullscreenchange", ()=> {
            let isfullscreen = !!document.fullscreenElement;
            if(! isfullscreen) {
                if(this.configPannel) {
                    EventBus.publish("session-config-pannel", "open")
                }
                this.left_pannel = true;
                this.top_pannel = true;
            }
        })
    },

    methods: {
        ...mapMutations(['setTheme']),
    }
    
}
</script>

<style lang="scss">
#app {
    width: 100%;
    height: 100%;

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
