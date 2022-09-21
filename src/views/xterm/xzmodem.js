import * as Zmodem from "nxshell-zmodem.js";
import { createLocalFs } from "../../services/nxsys/localfs";

let fsClient = null;

export class xzmodem {
    
    constructor(xterm=null) {
        this.xterm = xterm;
        this.zmodemInit();
    }

    async zmodemInit() {
        this.session = null;
        this.sending = false;
        this.send_file = null;
        this.sentry = new Zmodem.Sentry({
            to_terminal: (octets) => this.zmodemWrite(octets),
            sender: (octets) => this.zmodemSend(octets),
            on_retract: () => this.zmodemReset(),
            on_detect: (detection) => this.zmodemDetect(detection),
        });
        if(!fsClient) {
            fsClient = await createLocalFs();
        }
    }

    consume(data) {
        const { sentry } = this;
        try {
            sentry.consume(data);
        } catch (e) {
            console.log('consume error ', e);
            this.zmodemReset();
        }
    }

    zmodemWrite(octets) {
        this.xterm.write(octets);
    }

    zmodemSend(octets) {
        if(octets instanceof Array) {
            octets = Buffer.from(octets);
        }
        this.xterm.sendTo(octets)
    }

    zmodemReset() {
        if(this.detection) {
            this.detection.deny();
            this.detection = null;
        }
        this.zmodemInit();
    }

    handleInterrupt() {
        if(this.session) {
            this.session.abort();
        }
        this.zmodemReset();
    }

    zmodemDetect(detection) {
        this.detection = detection;
        this.session = detection.confirm();
        this.session.on('session_end', ()=> {this.zmodemReset()});

        if (this.session.type === 'send') {
            this.sendFiles();
        } else {
            this.revFiles();
        }
    }

    async dropFile(filePath) {
        if(this.sending) {
            return;
        }
        this.send_file = filePath;
        this.xterm.sendTo('rz -E \n');
    }

    async sendFiles() {
        const zsession = this.session;
        let filePath = null;
        if(this.send_file) {
            filePath = this.send_file;
        } else {
            const coreService = powertools.getService("powertools-core");
            const selectedFiles = await coreService.showOpenDialog({
                properties: ['openFile']
            });
            if(selectedFiles.canceled) {
                this.handleInterrupt();
                this.zmodemReset();
                return;
            }
            filePath = selectedFiles.filePaths[0];
        }
        // send file, not allow duplicate send file
        this.sending = true;
        let fileStats = await fsClient.stat(filePath);
        let fileName = await fsClient.basename(filePath);
        const fileObj = {
            name: fileName,
            size: fileStats.size
        }

        const BUFF_SIZE = 1024 * 5;
        const rwBuffer = Buffer.allocUnsafe(BUFF_SIZE);
        let that = this;

        zsession.send_offer(fileObj).then( async (xfer) => {
            if (!xfer) {
                that.sending = false;
                that.send_file = null;
                this.zmodemReset();
            } else {
                let r_handle = await fsClient.open(filePath, "r");
                let position = 0;
                while(true) {
                    let {bytesRead, buffer} = await fsClient.read(r_handle, rwBuffer, 0, BUFF_SIZE, position);
                    if(bytesRead) {
                        xfer.send(buffer.slice(0, bytesRead));
                    }
                    position += bytesRead;
                    that.writeProgress(fileObj.name, fileObj.size, position);

                    if(bytesRead < BUFF_SIZE) {
                        break;
                    }
                }
                xfer.end( [] ).then(()=>{
                    that.sending = false;
                    that.send_file = null;
                    zsession.close();
                    fsClient.close(r_handle);
                }).catch((e) => {
                    that.sending = false;
                    that.send_file = null;
                    zsession.close();
                    that.zmodemReset();
                    fsClient.close(r_handle);
                });
            }
        });
      
    }

    async revFiles() {
        const zsession = this.session;
        const coreService = powertools.getService("powertools-core");
        const selectedFiles = await coreService.showOpenDialog({
            properties: ['openDirectory']
        });

        if(selectedFiles.canceled) {
            this.handleInterrupt();
            this.zmodemReset();
            return;
        }
        const savePath = selectedFiles.filePaths[0];

        zsession.on("offer", async (offer) => {
            let details = offer.get_details();
            let real_path = await fsClient.pathresolve(savePath, details.name);
            let w_handle = await fsClient.open(real_path, "w");
            let position = 0;
            offer.on('input', (octets)=> {
                octets = Buffer.from(octets);
                fsClient.write(w_handle, octets, 0, octets.length, position)
                position += octets.length;
                this.writeProgress(details.name, details.size, position);
            })
            offer.accept().then(() => {
                fsClient.close(w_handle);
            }).catch((e) => {
                console.log('download error ', e);
                fsClient.close(w_handle);
            });

        });
        zsession.start();
    }

    writeProgress(name, size, offset) {
        const {bytesHuman} = this;
        const percent = ((100 * offset) / size).toFixed(2);
        let s = `${name} ${percent}% ${bytesHuman(offset, 2)}/${bytesHuman(size, 2)}\r`;
        this.zmodemWrite(s);
        if(offset == size) {
            //clear progress
            let c = '\r'.padStart(s.length + 3, ' ')
            this.zmodemWrite(c);
        }
    }

    bytesHuman(bytes, precision) {
        if (!/^([-+])?|(\.\d+)(\d+(\.\d+)?|(\d+\.)|Infinity)$/.test(bytes)) {
            return '-';
        }
        if (bytes === 0) return '0';
        if (typeof precision === 'undefined') precision = 1;
        const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const num = Math.floor(Math.log(bytes) / Math.log(1024));
        const value = (bytes / Math.pow(1024, Math.floor(num))).toFixed(precision);
        return `${value} ${units[num]}`;
    }
}
