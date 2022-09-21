import "./iconfont";
import Vue from "vue";

import PtIcon from "./icon.vue";

export default {
    install() {
        Vue.component(PtIcon.name, PtIcon);
    }
}