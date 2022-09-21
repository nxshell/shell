import { SESSION_TYPES, SessionInterface, registerSessionFactory } from "./session";

class GlobalSettingSession extends SessionInterface {
    constructor() {
        super("GlobalSetting", SESSION_TYPES.GLOBALSETTING)
    }
}

function createGlobalSettingSession() {
    return new GlobalSettingSession();
}


registerSessionFactory(SESSION_TYPES.GLOBALSETTING, createGlobalSettingSession);
