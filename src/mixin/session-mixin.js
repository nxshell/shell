import * as globalSetting from '@/services/globalSetting'

export const sessionMixin = {
    data() {
        return {
            theme: 'light'
        }
    },
    methods: {
        getProfileTheme() {
            const {theme} = globalSetting.getProfile('xterm')
            return theme ?? 'light'
        }
    }
}