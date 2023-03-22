import { defineStore } from 'pinia'
// @ts-ignore
import * as globalSetting from '@/services/globalSetting'

type ThemeType = 'light' | 'dark' | 'pink'
export type LayoutModeType = 'normal' | 'row' | 'col' | 'grid'

export interface ISetting {
    theme: ThemeType
    language: string
    userLock: boolean
    tabCloseConfirm: boolean
    configPanel: boolean
    layoutMode: LayoutModeType
    test: string
}

const useSettingStore = defineStore('setting', {
    state: (): ISetting => ({
        theme: (globalSetting.getProfile('xterm')?.theme as ThemeType) || 'light',
        language: 'zh-CN',
        userLock: false,
        tabCloseConfirm: (globalSetting.getProfile("xterm")?.noCloseConfirm as unknown as boolean) || false,
        configPanel: true,
        layoutMode: 'normal',
        test: '而此时'
    }),
    actions: {
        async changeTheme(theme: ThemeType) {
            const defaultSettings = globalSetting.getProfile('xterm')
            await globalSetting.updateProfile('xterm', { ...defaultSettings, theme: theme }).then(() => {
                this.theme = theme
                window.document.documentElement.setAttribute('nx-theme', theme)
            })
        },
        updateTabCloseConfirm(value: boolean) {
            const defaultSettings = globalSetting.getProfile("xterm")
            globalSetting.updateProfile("xterm", { ...defaultSettings, noCloseConfirm: value }).then(() => {
                this.tabCloseConfirm = value
            })
        }
    }
})
export default useSettingStore
