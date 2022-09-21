const { Socket } = require('net');
const { EventEmitter } = require("events");

const TelnetCommands = {
    SUBOPTION_SEND: 1,
    SUBOPTION_END: 240,
    GA: 249,
    SUBOPTION: 250,
    WILL: 251,
    WONT: 252,
    DO: 253,
    DONT: 254,
    IAC: 255,
}

const TelnetOptions =  {
    ECHO: 0x1,
    AUTH_OPTIONS: 0x25,
    SUPPRESS_GO_AHEAD: 0x03,
    TERMINAL_TYPE: 0x18,
    NEGO_WINDOW_SIZE: 0x1f,
    NEGO_TERMINAL_SPEED: 0x20,
    STATUS: 0x05,
    REMOTE_FLOW_CONTROL: 0x21,
    X_DISPLAY_LOCATION: 0x23,
    NEW_ENVIRON: 0x27,
}



class TelnetSession extends EventEmitter {
    socket = null;
    telnetProtocol = false;
    lastWidth = 0;
    lastHeight = 0; 
    requestedOptions = new Set();

    constructor (host, port) {
        super();
        this.host = host.trim();
        this.port = port;
    }

    async connect () {
        this.socket = new Socket()
        this.emitServiceMessage(`Connecting to ${this.host}`)

        return new Promise((resolve, reject) => {
            this.socket.on('error', err => {
                this.emitServiceMessage(`Socket error: ${err} \r\n`)
                reject(err)
                this.destroy()
            })
            this.socket.on('close', () => {
                this.emitServiceMessage('Connection closed \r\n')
                this.destroy()
                this.emit("close")
            })
            this.socket.on('data', data => this.onData(data))
            this.socket.connect(this.port ?? 23, this.host, () => {
                this.emitServiceMessage('Connected \r\n')
                this.open = true
                resolve()
            })
        })
    }

    requestOption (cmd, option) {
        this.requestedOptions.add(option)
        this.emitTelnet(cmd, option)
    }

    emitServiceMessage (msg) {
        this.emit("data", msg)
    }

    onData (data) {
        if (!this.telnetProtocol && data[0] === TelnetCommands.IAC) {
            this.telnetProtocol = true
            this.requestOption(TelnetCommands.DO, TelnetOptions.SUPPRESS_GO_AHEAD)
            this.emitTelnet(TelnetCommands.WILL, TelnetOptions.TERMINAL_TYPE)
            this.emitTelnet(TelnetCommands.WILL, TelnetOptions.NEGO_WINDOW_SIZE)
        }
        if (this.telnetProtocol) {
            data = this.processTelnetProtocol(data)
        }
        this.emitOutput(data)
    }

    emitOutput(data) {
        this.emit("data", data)
    }

    emitTelnet (command, option) {
        //console.log('>', TelnetCommands[command], TelnetOptions[option] || option)
        this.socket.write(Buffer.from([TelnetCommands.IAC, command, option]))
    }

    emitTelnetSuboption (option, value) {
        //console.log('>', 'SUBOPTION', TelnetOptions[option], value)
        this.socket.write(Buffer.from([
            TelnetCommands.IAC,
            TelnetCommands.SUBOPTION,
            option,
            ...value,
            TelnetCommands.IAC,
            TelnetCommands.SUBOPTION_END,
        ]))
    }

    processTelnetProtocol (data) {
        while (data.length) {
            if (data[0] === TelnetCommands.IAC) {
                const command = data[1]
                const commandName = TelnetCommands[command]
                const option = data[2]
                const optionName = TelnetOptions[option]

                if (command === TelnetCommands.IAC) {
                    data = data.slice(1)
                    break
                }

                data = data.slice(3)
                //console.log('<', commandName || command, optionName || option)

                if (command === TelnetCommands.WILL || command === TelnetCommands.WONT) {
                    if (this.requestedOptions.has(option)) {
                        this.requestedOptions.delete(option)
                        continue
                    }
                }

                if (command === TelnetCommands.WILL) {
                    if ([
                        TelnetOptions.SUPPRESS_GO_AHEAD,
                        TelnetOptions.ECHO,
                    ].includes(option)) {
                        this.emitTelnet(TelnetCommands.DO, option)
                    } else {
                        //console.log('(!) Unhandled option', option)
                        this.emitTelnet(TelnetCommands.DONT, option)
                    }
                }
                if (command === TelnetCommands.DO) {
                    if (option === TelnetOptions.NEGO_WINDOW_SIZE) {
                        this.emitTelnet(TelnetCommands.WILL, option)
                        this.emitSize()
                    } else if (option === TelnetOptions.ECHO) {
                        this.emitTelnet(TelnetCommands.WONT, option)
                    } else if (option === TelnetOptions.TERMINAL_TYPE) {
                        this.emitTelnet(TelnetCommands.WILL, option)
                    } else {
                        //console.log('(!) Unhandled option', option)
                        this.emitTelnet(TelnetCommands.WONT, option)
                    }
                }
                if (command === TelnetCommands.DONT) {
                    if (option === TelnetOptions.ECHO) {
                        this.emitTelnet(TelnetCommands.WONT, option)
                    } else {
                        //console.log('(!) Unhandled option', option)
                        this.emitTelnet(TelnetCommands.WILL, option)
                    }
                }
                if (command === TelnetCommands.SUBOPTION) {
                    const endIndex = data.indexOf(TelnetCommands.IAC)
                    const optionValue = data.slice(0, endIndex)
                    //console.log('<', commandName || command, optionName || option, optionValue)

                    if (option === TelnetOptions.TERMINAL_TYPE && optionValue[0] === TelnetCommands.SUBOPTION_SEND) {
                        this.emitTelnetSuboption(option, Buffer.from([0, ...Buffer.from('XTERM-256COLOR')]))
                    }

                    data = data.slice(endIndex + 2)
                }
            } else {
                return data
            }
        }
        return data
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    resize (w, h) {
        if (w && h) {
            this.lastWidth = w
            this.lastHeight = h
        }
        if (this.lastWidth && this.lastHeight && this.telnetProtocol) {
            this.emitSize()
        }
    }

    emitSize () {
        if (this.lastWidth && this.lastHeight) {
            this.emitTelnetSuboption(TelnetOptions.NEGO_WINDOW_SIZE, Buffer.from([
                this.lastWidth >> 8, this.lastWidth & 0xff,
                this.lastHeight >> 8, this.lastHeight & 0xff,
            ]))
        } else {
            this.emitTelnet(TelnetCommands.WONT, TelnetOptions.NEGO_WINDOW_SIZE)
        }
    }

    write (data) {
        this.socket.write(data)
    }

    kill () {
        this.socket.destroy()
    }

    async destroy () {
        return this.kill()
    }
}

module.exports = {
    Telnet: TelnetSession
}
