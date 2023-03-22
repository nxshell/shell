import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

import useSettingStore from '@/store/modules/app-setting'
import useTabStore from '@/store/modules/tabs'
import useSessionStore from "@/store/modules/session";

Vue.use(PiniaVuePlugin)

const pinia = createPinia()

export { useSettingStore, useTabStore,useSessionStore }
export default pinia
