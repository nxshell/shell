const { EventEmitter } = require("events");

class NxDataTransfer extends EventEmitter {
    constructor() {
        super();
    }

    /**
     * 设置来源数据
     * @param {NxTransferDataDesc} from 设置来源数据
     */
    _setFrom(from) {}

    /**
     * 设置目标数据
     * @param {NxTransferDataDesc} to 设置目标数据
     */
    _setTo(to) {}


    /**
     * 绑定通道数据
     * @param {Number} channelId 绑定的通道Id
     */
    _bindChannel(channelId) {}

    startTransferring() {
    }
}

module.exports = {
    NxDataTransfer
};
