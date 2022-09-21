import { NxDataTransfer } from "../../../common/nxsys/dataTransfer";

class NxDataTransferClient extends NxDataTransfer {
    constructor(handle) {
        super();
        this.service = powertools.getService();
        this.handle = handle;
    }

    async _init() {
        this.channel = this.service.createChannel();
        await this._bindChannel(this.channel.channelId);
    }

    async _setFrom(from) {
        await this.service.callObject(this.handle, "_setFrom", from);
    }

    async _setTo(to) {
        await this.service.callObject(this.handle, "_setTo", to);
    }

    async _bindChannel(channelId) {
        this.channel.on("data", (eventInfo) => {
            const {event, args} = eventInfo;
            this.emit(event, args);
        });

        await this.service.callObject(this.handle, "_bindChannel", channelId);
    }

    async answer(action, keep) {
        await this.service.callObject(this.handle, "answer", action, keep);
    }

    async startTransferring() {
        await this.service.callObject(this.handle, "startTransferring");
    }
}

export async function createDataTransfer() {
    const service = powertools.getService();

    const handle = await service.createDataTransfer();

    const client = new NxDataTransferClient(handle);
    await client._init();

    return client;
}
