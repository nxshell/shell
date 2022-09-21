const { EventEmitter } = require("events");

class NxLogger extends EventEmitter {
    constructor(file) {
        super();
        this.file = file;
    }

    info() {

    }
}

module.exports = {
    NxLogger
};
