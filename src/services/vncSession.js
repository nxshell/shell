import { SESSION_TYPES, SessionInterface, registerSessionFactory } from "./session";

class VNCSession extends SessionInterface {
    fsInstance = null;
    cfg = null;
    constructor(params) {
        super(params.name, SESSION_TYPES.VNC);
        this.cfg = params;
    }

    async init() {
    }
}

async function createVNCSession(params) {
    return new VNCSession(params);
}

registerSessionFactory(SESSION_TYPES.VNC, createVNCSession);
