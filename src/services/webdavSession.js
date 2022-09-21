import { SESSION_TYPES, SessionInterface, registerSessionFactory } from "./session";
import { createFsInstance } from "./filesystem"

class WDSession extends SessionInterface {
    fsInstance = null;
    params = null;
    constructor(params) {
        super("WEBDAV", SESSION_TYPES.WEBDAV);
        this.params = params;
    }

    async init() {
        const cfg = this.params;
        let secure = cfg.secure;
        try{
            secure = JSON.parse(cfg.secure);
        }catch(e){
        }
        const sftpFsInstance = await createFsInstance({
            url: cfg.url,
            protocol: 'webdav',
            username: cfg.username,
            password: cfg.password
        });
        this.fsInstance = sftpFsInstance;
    }

    getFs() {
        return this.fsInstance;
    }
}

async function createWebDavSession(params) {
    const sessionInst = new WDSession(params);
    await sessionInst.init();
    return sessionInst;
}

registerSessionFactory(SESSION_TYPES.WEBDAV, createWebDavSession);
