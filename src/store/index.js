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
        configPannel: true,
        keyboradToAll: false,
        userLock: false,
        theme: "light",
    },
    mutations: {
        setUserInfo(state, newUserInfo) {
            state.userInfo = newUserInfo;
        },
        setConfigPannel(state, status) {
            state.configPannel = !!status;
        },
        setKeyboradToAll(state, status) {
            state.keyboradToAll = !!status;
        },
        setUserLock(state, status) {
            state.userLock = !!status;
        },
        setTheme(state, theme) {
            state.theme = theme;
            globalSetting.setProfile("xterm", {theme: theme})
        }
    },
    actions: {
    },
    getters: {
        userInfo(state) {
            return state.userInfo;
        },
        configPannel(state) {
            return state.configPannel;
        },
        keyboradToAll(state) {
            return state.keyboradToAll;
        },
        userLock(state) {
            return state.userLock;
        },
        theme(state) {
            return state.theme;
        },
    },
    plugins: [userInfoPlugin()]
})
