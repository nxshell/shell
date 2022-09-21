const iconv = require('iconv-lite');
const stream = require('stream');
const { EventEmitter } = require("events");

iconv.enableStreamingAPI(stream)


class Iconv extends EventEmitter {

    constructor(f, t) {
        super()
        this.input = new iconv.decodeStream(f);
        this.output = new iconv.encodeStream(t);

        this.input.on('data', (input) => {
            this.output.write(input);
        })

        this.output.on('data', (output) => {
            this.emit('data', output)
        })
    }

    write(d) {
        if(d instanceof Array) {
            d = Buffer.from(d);
        }
        this.input.write(d);
    }
}

class NoIconv extends EventEmitter {
    constructor() {
        super()
    }

    write(d) {
        this.emit('data', d);
    }
}


export function create_iconv(from, to) {
    if(from === to ) {
        return new NoIconv();
    } else {
        return new Iconv(from, to);
    }
}