import { defineStore } from "pinia"
import { getProfile, updateProfile } from "@/services/globalSetting"

type ThemeType = "light" | "dark" | "pink"
export type LayoutModeType = "normal" | "row" | "col" | "grid"

export interface ISetting {
	theme: ThemeType
	userLock: boolean
	configPanel: boolean
	layoutMode: LayoutModeType
}

const useSettingStore = defineStore("setting", {
	state: (): ISetting => ({
		theme: (getProfile("xterm")?.theme as ThemeType) || "light",
		userLock: false,
		configPanel: true,
		layoutMode: "normal"
	}),
	actions: {
		async changeTheme(theme: ThemeType) {
			const defaultSettings = getProfile("xterm")
			await updateProfile("xterm", { ...defaultSettings, theme: theme }).then(() => {
				this.theme = theme
				window.document.documentElement.setAttribute("nx-theme", theme)
			})
		},
		updateLayoutMode(layout: LayoutModeType) {
			this.layoutMode = layout
		}
	}
})
export default useSettingStore
