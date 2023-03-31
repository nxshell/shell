import { defineStore } from 'pinia'
import router from '@/router'

export interface ITabProp {
    currentSelectedSessionNode: any
    activeTabIndex: number
    sessionInstTabs: any[]
    editorChange: boolean
    configPanel: boolean
    showTabs: boolean
}

const useTabStore = defineStore('tab', {
    state: (): ITabProp => ({
        currentSelectedSessionNode: null,
        activeTabIndex: 0,
        sessionInstTabs: [],
        editorChange: false,
        configPanel: true,
        showTabs: true
    }),
    actions: {
        updateActiveTabIndex(tabIndex: number) {
            let index = tabIndex
            if (this.activeTabIndex === tabIndex) {
                index = this.activeTabIndex - 1
                index = this.activeTabIndex > 0 ? this.activeTabIndex : 0
            }
            this.activeTabIndex = index
        },
        updateSelectSessionNode(sessionNode: any) {
            this.currentSelectedSessionNode = sessionNode
        },
        /**
         * 根据选中的菜单高亮匹配的tab
         *
         * @param currentRoutePath 当前路由的path
         * @param sessionInstance 会话实例
         */
        async activateSession(currentRoutePath: string, sessionInstance: any) {
            if (!sessionInstance) {
                return
            }
            const { path } = sessionInstance.router
            if (path === currentRoutePath) {
                return
            }
            await router.push({ path: path })
            const activeSessionIndex = this.sessionInstTabs.findIndex((inst) => {
                return inst.data.id === sessionInstance.id
            })
            this.updateActiveTabIndex(activeSessionIndex)
            sessionInstance.active()
        }
    }
})
export default useTabStore
