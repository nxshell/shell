import { defineStore } from 'pinia'
// @ts-ignore
import * as globalSetting from '@/services/globalSetting'

type ThemeType = 'light' | 'dark' | 'pink'
export type LayoutModeType = 'normal' | 'row' | 'col' | 'grid'

export interface ISetting {
    theme: ThemeType
    language: string
    userLock: boolean
    configPanel: boolean
    layoutMode: LayoutModeType
}

const useSettingStore = defineStore('setting', {
    state: (): ISetting => ({
        theme: (globalSetting.getProfile('xterm')?.theme as ThemeType) || 'light',
        language: 'zh-CN',
        userLock: false,
        configPanel: true,
        layoutMode: 'normal'
    }),
    actions: {
        async changeTheme(theme: ThemeType) {
            const defaultSettings = globalSetting.getProfile('xterm')
            await globalSetting.updateProfile('xterm', { ...defaultSettings, theme: theme }).then(() => {
                this.theme = theme
                window.document.documentElement.setAttribute('nx-theme', theme)
            })
        },
        updateLayoutMode(layout: LayoutModeType) {
            this.layoutMode = layout
        }
    }
})
export default useSettingStore
