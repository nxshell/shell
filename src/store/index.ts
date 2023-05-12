import Vue from "vue"
import { createPinia, PiniaVuePlugin } from "pinia"
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import useSettingStore, { LayoutModeType } from "@/store/modules/app-setting"
import useSessionStore from "@/store/modules/session"
import useNxTabsStore from "./modules/nx-tabs"
import useMenuStore from "./modules/nx-menu"

Vue.use(PiniaVuePlugin)

const pinia = createPinia()
// pinia.use(piniaPluginPersistedstate)

export { useSettingStore, useSessionStore, type LayoutModeType, useNxTabsStore, useMenuStore }
export default pinia
