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
        theme: globalSetting.getProfile('xterm')?.theme,
        showTabs: true,
        currentSelectedSessionNode: null,
        activeTabIndex: 0,
        sessionInstTabs: []
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
            const defaultSettings = globalSetting.getProfile("xterm")
            globalSetting.updateProfile("xterm", { ...defaultSettings, theme: theme }).then(() => {
                state.theme = theme;
            })
        },
        setShowTabs(state, status) {
            state.showTabs = !!status
        },
        updateCurrentSelectedSessionNode(state, session) {
            state.currentSelectedSessionNode = session
        },
        COMMIT_ACTIVE_TAB_INDEX(state, tabIndex) {
            state.activeTabIndex = tabIndex
        },
        COMMIT_SESSION_TABS(state, sessionTabs) {
            state.sessionInstTabs = sessionTabs
        },
        removeSessionInstTabs(state, sessionTab) {

        }
    },
    actions: {
        updateActiveTabIndex({ commit, state }, tabIndex) {
            let index = tabIndex
            if (state.activeTabIndex === tabIndex) {
                index = state.activeTabIndex - 1
                index = state.activeTabIndex > 0 ? state.activeTabIndex : 0
            }
            commit('COMMIT_ACTIVE_TAB_INDEX', index)
        },
        updateSessionInstanceTabs({ commit }, sessionTabs) {
            commit('COMMIT_SESSION_TABS', sessionTabs)
        },
    },
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
            return globalSetting.getProfile("xterm")?.theme ?? state.theme
        },
        showTabs(state) {
            return state.showTabs
        },
        currentSelectedSessionNode(state) {
            return state.currentSelectedSessionNode
        },
        activeTabIndex(state) {
            return state.activeTabIndex
        },
        sessionInstTabs(state) {
            return state.sessionInstTabs
        }
    },
    plugins: [userInfoPlugin()]
})
