class WaitObject {
    resolve = null;
    reject = null;
    p = null;
    constructor() {
        this.p = new Promise((resolve, reject) => {
            this.resolve = (v) => {
                resolve(v);
            };
            this.reject = (e) => {
                reject(e);
            };
        });
    }

    wait() {
        return this.p;
    }
}

module.exports = WaitObject;
