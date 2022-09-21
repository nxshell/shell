import { NxLogger } from "../../../common/nxsys/logger";

class NxLoggerClient extends NxLogger {
    constructor(handle) {
        super();
        this.service = powertools.getService();
        this.handle = handle;
    }

    async _init() {
    }

    async info(s) {
        await this.service.callObject(this.handle, "info", s);
    }
}

export async function createLogger(file) {
    const service = powertools.getService();

    const handle = await service.createLogger(file);

    const client = new NxLoggerClient(handle);
    await client._init();

    return client;
}
