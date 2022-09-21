const { EventEmitter } = require("events");
import Storage from "./storage";

class SessionRecent extends EventEmitter{
    recentList = [];
    constructor() {
        super();
        this._load();
    }

    async _load() {
        let list = await Storage.read("RECENT");
        this.recentList = list || [];
    }

    _save() {
        Storage.save("RECENT", this.recentList);
    }

    _find(uuid) {
        return this.recentList.findIndex(item => item.uuid === uuid)
    }

    addRecent(uuid, name) {
        const idx = this._find(uuid);
        if (idx == -1) {
            this.recentList.unshift({uuid, name})
        } else {
            this.moveToTop(uuid, false);
        }

        this._save();
        this.emit("recent-update");
    }

    getRecentList(maxCount) {
        if (typeof maxCount === 'number' && maxCount > 0) {
            return this.recentList.slice(0, maxCount)
        }
        return this.recentList;
    }

    removeRecent(uuid) {
        const idx = this._find(uuid);
        if (idx !== -1) {
            this.recentList.splice(idx, 1);
        }
        this._save();
        this.emit("recent-update");
    }

    moveToTop(uuid, emit=true) {
        const idx = this._find(uuid);
        if (idx === -1) {
            return;
        }
        let moveNodes = this.recentList.splice(idx, 1);
        this.recentList.unshift(...moveNodes);
        if (emit) {
            this.emit("recent-update");
        }
        this._save();
    }
}

export default SessionRecent;
