import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./store";

import "@fontsource/dejavu-mono";
import "./assets/scss/default.scss";

import PtComponents from "@/components";
import PtSessionManger from "@/services";

import Element from './element'
import '@/icons'
import i18n from '@/locals'

Vue.use(PtComponents);
Vue.use(PtSessionManger);
Vue.use(Element)

Vue.config.productionTip = false;

!async function () {
    await PtSessionManger.initService();

    new Vue({
        router,
        pinia,
        i18n,
        render: h => h(App)
    }).$mount("#app");
}();

window.addEventListener("keydown", (evt) => {
    if (evt.ctrlKey && evt.key === "r") {
        evt.preventDefault();
    }
    if (evt.metaKey && evt.key === "r") {
        evt.preventDefault();
    }
})