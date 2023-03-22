import VueI18n from 'vue-i18n'
import { createI18n } from 'vue-i18n-bridge'
import zh from './lang/zh-CN.json'
import en from './lang/en-US.json'
import Vue from 'vue'
import * as globalSetting from '@/services/globalSetting'

const language = globalSetting.getProfile('xterm')?.language ?? 'zh-CN'
Vue.use(VueI18n, { bridge: true })
// 创建vue-i18n实例i18n
const i18n = createI18n(
    {
        legacy: false,
        locale: language,// 默认语言
        // fallbackLocale: 'en-US',// 不存在默认则为英文
        allowComposition: true,// 允许组合式api
        silentTranslationWarn: true,
        missingWarn: false,
        fallbackWarn: false,
        datetimeFormats: {
            'en-US': {
                long: {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            },
            'zh-CN': {
                long: {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            }
        },
        // 添加多语言（每一个语言标示对应一个语言文件）
        messages: {
            'zh-CN': zh,
            'en-US': en
        }
    },
    VueI18n
)
Vue.use(i18n)
export default i18n