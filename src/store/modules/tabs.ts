import { defineStore } from 'pinia'

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
        updateSessionInstanceTabs(sessionTabs: any) {
            this.sessionInstTabs = sessionTabs
        },
        updateSelectSessionNode(sessionNode: any) {
            this.currentSelectedSessionNode = sessionNode
        }
    }
})
export default useTabStore
