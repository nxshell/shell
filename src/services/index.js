import "./shellSession";
import "./serialportSession";
import "./sftpSession";
import "./editorSession";
import "./ftpSession";
import "./webdavSession";
import "./welcomeSession";
import "./loginSession";
import "./telnetSession";
import "./localshellSession";
import "./vncSession";
import "./globalSettingSession";

import sessionManager from "./sessionMgr";
import * as globalSetting from "./globalSetting";


export default {
    install(Vue) {
        Object.defineProperty(Vue.prototype, '$sessionManager', {
            get() {
                return sessionManager;
            }
        })
    },

    async initService() {
        /** 初始化Session数据 */
        await globalSetting.loadGlobalProfile();
        let configs = globalSetting.getProfile("xterm");
        if (configs && (configs.nxconfig != "")) {
            await sessionManager.setConfigPath(configs.nxconfig);
            // load again
            await globalSetting.loadGlobalProfile();
        }
        await sessionManager.loadSessionConfigs();
        
    }
}
