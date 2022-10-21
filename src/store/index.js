import Vue from 'vue'
import Vuex from 'vuex'

import Storage from "../services/storage";
import * as globalSetting from "@/services/globalSetting";

Vue.use(Vuex)

function userInfoPlugin() {
    return store => {
        store.subscribe(mutation => {
            if (mutation.type === "setUserInfo") {
                Storage.save("USERINFO", mutation.payload);
            }
        });

        Storage.read("USERINFO").then((userInfo) => {
            if (userInfo) {
                store.commit("setUserInfo", userInfo);
            }
        })
    }
}

export default new Vuex.Store({
    state: {
        userInfo: null,
        configPanel: true,
        keyboardToAll: false,
        userLock: false,
        theme: "light",
        showTabs: true,
    },
    mutations: {
        setUserInfo(state, newUserInfo) {
            state.userInfo = newUserInfo;
        },
        setConfigPanel(state, status) {
            state.configPanel = !!status;
        },
        setKeyboardToAll(state, status) {
            state.keyboardToAll = !!status;
        },
        setUserLock(state, status) {
            state.userLock = !!status;
        },
        setTheme(state, theme) {
            state.theme = theme;
            globalSetting.setProfile("xterm", { theme: theme })
        },
        setShowTabs(state, status) {
            state.showTabs = !!status
        }
    },
    actions: {},
    getters: {
        userInfo(state) {
            return state.userInfo;
        },
        configPanel(state) {
            return state.configPanel;
        },
        keyboardToAll(state) {
            return state.keyboardToAll;
        },
        userLock(state) {
            return state.userLock;
        },
        theme(state) {
            return state.theme;
        },
        showTabs(state) {
            return state.showTabs
        }
    },
    plugins: [userInfoPlugin()]
})
