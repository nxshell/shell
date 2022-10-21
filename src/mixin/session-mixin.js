import * as globalSetting from '@/services/globalSetting'
import { mapGetters } from 'vuex'

export const sessionMixin = {
    computed: {
        ...mapGetters(['theme'])
    },
    methods: {
        getProfileTheme() {
            const { theme } = globalSetting.getProfile('xterm')
            return theme ?? 'light'
        }
    }
}