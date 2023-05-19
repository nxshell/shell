import VueI18n from "vue-i18n"
import { createI18n } from "vue-i18n-bridge"
import zh from "./lang/zh-CN.json"
import en from "./lang/en-US.json"
import Vue from "vue"
import { getProfile, loadGlobalProfile } from "@/services/globalSetting"

async function initI18n() {
	const settings = getProfile("xterm")
	if (settings === null) {
		await loadGlobalProfile()
	}
	const language = settings?.language ?? "zh-CN"
	Vue.use(VueI18n, { bridge: true })
	// 创建vue-i18n实例i18n
	const i18n = createI18n(
		{
			legacy: false,
			locale: language, // 默认语言
			// fallbackLocale: 'en-US',// 不存在默认则为英文
			allowComposition: true, // 允许组合式api
			silentTranslationWarn: true,
			missingWarn: false,
			fallbackWarn: false,
			datetimeFormats: {
				"zh-CN": {
					short: {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
						hour: "2-digit",
						minute: "2-digit"
					},
					long: {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
						hour: "2-digit",
						minute: "2-digit"
					}
				},
				"en-US": {
					short: {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
						hour: "2-digit",
						minute: "2-digit"
					},
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
				"zh-CN": zh,
				"en-US": en
			}
		},
		VueI18n
	)
	Vue.use(i18n)
	return i18n
}

export default initI18n()
