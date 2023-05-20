import "./shellSession"
import "./serialportSession"
import "./sftpSession"
import "./editorSession"
import "./ftpSession"
import "./webdavSession"
import "./welcomeSession"
import "./loginSession"
import "./telnetSession"
import "./localshellSession"
import "./vncSession"
import "./globalSettingSession"

import sessionManager from "./sessionMgr"
import { loadGlobalProfile, getProfile } from "./globalSetting"

export default {
	install(Vue) {
		Object.defineProperty(Vue.prototype, "$sessionManager", {
			get() {
				return sessionManager
			}
		})
	},

	async initService() {
		/** 初始化Session数据 */
		await loadGlobalProfile()
		let configs = getProfile("xterm")
		if (configs && configs.nxconfig) {
			await sessionManager.setConfigPath(configs.nxconfig)
			// load again
			await loadGlobalProfile()
		}
		await sessionManager.loadSessionConfigs()
	}
}
