<template>
    <div class="pt-shell-profile" @keydown.enter="doOK">
        <pt-row>
            <pt-col :span="6">
                <!-- <pt-list dataKey="name" :listData="navList">
                    <template v-slot="scope">
                        <span>{{ scope.item.data.title }}</span>
                    </template>
                </pt-list> -->
                <div class="nav-tree-container">
                    <pt-tree :treeData="navList"
                        dataKey="name"
                        @tree-node-select="handleNavToSection"
                    ></pt-tree>
                </div>
                
            </pt-col>
            <pt-col :span="18">
                <div class="pt-switch">
                    <label class="pt-switch-tip">{{ T("home.profile.operator.configure-mode") }}</label>
                    <pt-switch-button @setIsActive="set_config_mode($event)" />
                </div>
                <div v-for="(value, key) in sessionsStates" :key="key"
                    class="profile-container"
                    v-show="key == currentSessionInstId"
                >
                    <pt-profile-view v-model="value.profileData"
                        :sections="profiles"
                        :simple="simple"
                        :curSection="value.profileCurSection"
                    />
                </div>
                <div class="operator-container">
                    <pt-button type="primary" className="btn-save" @click="handleSaveClick">{{ T("home.profile.operator.save") }}</pt-button>
                    <pt-button className="btn-save-connect" @click="handleSaveAndConnectClick">{{ T("home.profile.operator.save-conn") }}</pt-button>
                </div>
            </pt-col>
        </pt-row>
    </div>
</template>

<script>
import PtProfileView from "../components/profile/profileview";
import XTermTheme from "../profiles/xtermTheme";
import PtProfileItem from "../components/profile/profileitem";
import * as globalSetting from "../../services/globalSetting";

export default {
    name: "PtShellProfile",
    components: {
        PtProfileView
    },
    data() {
        return {
            simple: true,
            navList: [
                {
                    name: "base",
                    text: "home.profile.base.title"
                },
                {
                    name: "auth",
                    text: "home.profile.auth.title"
                },
                {
                    name: "connect",
                    text: "home.profile.connect.title"
                },
                {
                    name: "terminal",
                    text: "home.profile.terminal.title"
                }
            ],
            profiles: [
                {
                    title: "home.profile.base.title",
                    name: "base",
                    items: [
                        {
                            name: "hostName",
                            title: "home.profile.base.host-name.title",
                            description: "home.profile.base.host-name.description",
                            defaultValue: "",
                            type: "text"
                        },
                        {
                            name: "osType",
                            title: "home.profile.base.os.title",
                            description: "home.profile.base.os.description",
                            defaultValue: "auto",
                            type: "select",
                            options: [
                                {
                                    label: "home.profile.base.os.options.auto",
                                    value: "auto"
                                },
                                {
                                    label: "CentOS 6",
                                    value: "centos6"
                                },
                                {
                                    label: "CentOS 7",
                                    value: "centos7"
                                },
                                {
                                    label: "CentOS 8",
                                    value: "centos8"
                                },
                                {
                                    label: "Redhat Enterprise Linux 6",
                                    value: "redhat6"
                                },
                                {
                                    label: "Redhat Enterprise Linux 7",
                                    value: "redhat7"
                                },
                                {
                                    label: "Redhat Enterprise Linux 8",
                                    value: "redhat8"
                                },
                                {
                                    label: "Ubuntu 18.04",
                                    value: "ubuntu18"
                                },
                                {
                                    label: "Ubuntu 20.04",
                                    value: "ubuntu20"
                                },
                                {
                                    label: "Arch Linux",
                                    value: "arch"
                                },
                                {
                                    label: "Kali Linux",
                                    value: "kali"
                                },
                                {
                                    label: "Debian",
                                    value: "debian"
                                },
                                {
                                    label: "Deepin",
                                    value: "deepin"
                                },
                                {
                                    label: "Oracle Linux",
                                    value: "oracle"
                                },
                                {
                                    label: "Fedora",
                                    value: "fedora"
                                },
                                {
                                    label: "SUSE",
                                    value: "suse"
                                }
                            ]
                        },
                        {
                            name: "protocal",
                            title: "home.profile.base.protocol.title",
                            description: "home.profile.base.protocol.description",
                            defaultValue: "ssh",
                            type: "select",
                            options: [
                                {
                                    label: "SSH",
                                    value: "ssh"
                                },
                                {
                                    label: "FTP",
                                    value: "ftp"
                                },
                                {
                                    label: "Serial",
                                    value: "serialport"
                                },
                                {
                                    label: "Telnet",
                                    value: "telnet"
                                },
                                {
                                    label: "LocalShell",
                                    value: "localshell"
                                },
                                {
                                    label: "VNC",
                                    value: "vnc"
                                }
                                /*{
                                    label: "WEBDAV",
                                    value: "webdav"
                                }*/
                            ]
                        },
                        {
                            name: "hostAddress",
                            title: "home.profile.base.host.title",
                            description: "home.profile.base.host.description",
                            defaultValue: "",
                            type: "text",
                            show: "(protocal == 'ssh') || (protocal == 'ftp') || (protocal == 'telnet') || (protocal == 'vnc')"
                        },
                        {
                            name: "hostPort",
                            title: "home.profile.base.port.title",
                            description: "home.profile.base.port.description",
                            defaultValue: "22",
                            type: "text",
                            show: "protocal == 'ssh'"
                        },
                        {
                            name: "hostFtpPort",
                            title: "home.profile.base.port.title",
                            description: "home.profile.base.port.ftpdescription",
                            defaultValue: "21",
                            type: "text",
                            show: "protocal == 'ftp'"
                        },
                        {
                            name: "hostTelnetPort",
                            title: "home.profile.base.port.title",
                            description: "home.profile.base.port.telnetdescription",
                            defaultValue: "23",
                            type: "text",
                            show: "protocal == 'telnet'"
                        },
                        {
                            name: "hostVncPort",
                            title: "home.profile.base.port.title",
                            description: "home.profile.base.port.vncdescription",
                            defaultValue: "5800",
                            type: "text",
                            show: "protocal == 'vnc'"
                        }
                    ]
                },
                {
                    show: "protocal == 'vnc'",
                    title: "home.profile.auth.title",
                    name: "auth",
                    items: [
                        {
                            name: "username",
                            title: "home.profile.auth.username.title",
                            description: "home.profile.auth.username.description",
                            defaultValue: "",
                            type: "text"
                        },
                        {
                            name: "password",
                            title: "home.profile.auth.password.title",
                            description: "home.profile.auth.password.description",
                            defaultValue: "",
                            type: "password",
                        }
                    ]
                },
                {
                    show: "protocal == 'webdav'",
                    title: "home.profile.auth.title",
                    name: "auth",
                    items: [
                        {
                            name: "url",
                            title: "home.profile.auth.url.title",
                            description: "home.profile.auth.url.description",
                            defaultValue: "https://127.0.0.1/webdav",
                            type: "text",
                            show: "protocal == 'webdav'"
                        },
                        {
                            name: "username",
                            title: "home.profile.auth.username.title",
                            description: "home.profile.auth.username.description",
                            defaultValue: "",
                            type: "text"
                        },
                        {
                            name: "password",
                            title: "home.profile.auth.password.title",
                            description: "home.profile.auth.password.description",
                            defaultValue: "",
                            type: "password",
                        }
                    ]
                },
                {
                    show: "protocal == 'ftp'",
                    title: "home.profile.auth.title",
                    name: "auth",
                    items: [
                        {
                            name: "username",
                            title: "home.profile.auth.username.title",
                            description: "home.profile.auth.username.description",
                            defaultValue: "",
                            type: "text"
                        },
                        {
                            name: "password",
                            title: "home.profile.auth.password.title",
                            description: "home.profile.auth.password.description",
                            defaultValue: "",
                            type: "password",
                        },
                        {
                            name: "secure",
                            title: "home.profile.auth.secure.title",
                            description: "home.profile.auth.secure.description",
                            defaultValue: "false",
                            type: "select",
                            options: [
                                {
                                    label: "home.profile.auth.secure.options.false",
                                    value: "false"
                                },
                                {
                                    label: "home.profile.auth.secure.options.true",
                                    value: "true"
                                },
                                {
                                    label: "home.profile.auth.secure.options.control",
                                    value: "control"
                                }
                            ]
                        }
                    ]
                }, 
                {
                    show: "protocal == 'ssh'",
                    title: "home.profile.auth.title",
                    name: "auth",
                    items: [
                        {
                            name: "authType",
                            title: "home.profile.auth.auth-type.title",
                            description: "home.profile.auth.auth-type.description",
                            defaultValue: "keyboard-interactive",
                            type: "select",
                            options: [
                                {
                                    label: "home.profile.auth.auth-type.options.password",
                                    value: "password"
                                },
                                {
                                    label: "home.profile.auth.auth-type.options.publickey",
                                    value: "cert"
                                },
                                {
                                    label: "home.profile.auth.auth-type.options.keyboard-interactive",
                                    value: "keyboard-interactive"
                                }
                            ]
                        },
                        {
                            name: "username",
                            title: "home.profile.auth.username.title",
                            description: "home.profile.auth.username.description",
                            defaultValue: "",
                            type: "text"
                        },
                        {
                            name: "password",
                            title: "home.profile.auth.password.title",
                            description: "home.profile.auth.password.description",
                            defaultValue: "",
                            type: "password",
                            show: "authType == 'password'"
                        },
                        {
                            name: "cert",
                            title: "home.profile.auth.publickey.title",
                            description: "home.profile.auth.publickey.description",
                            defaultValue: "",
                            type: "file",
                            show: "authType == 'cert'"
                        },
                        {
                            name: "passphrase",
                            title: "home.profile.auth.passphrase.title",
                            description: "home.profile.auth.passphrase.description",
                            defaultValue: "",
                            type: "password",
                            show: "authType == 'cert'"
                        }
                    ]
                },
                {
                    show: "protocal == 'ssh'",
                    title: "home.profile.connect.title",
                    name: "connect",
                    items: [
                        {
                            name: "keepAliveInterval",
                            title: "home.profile.connect.keepalive.title",
                            description: "home.profile.connect.keepalive.description",
                            defaultValue: "60",
                            type: "number"
                        },
                        {
                            name: "keepAliveCountMax",
                            title: "home.profile.connect.keepalive-count-max.title",
                            description: "home.profile.connect.keepalive-count-max.description",
                            defaultValue: "3",
                            type: "number"
                        },
                        {
                            name: "readyTimeout",
                            title: "home.profile.connect.ready-timeout.title",
                            description: "home.profile.connect.ready-timeout.description",
                            defaultValue: "20000",
                            type: "number"
                        },
                        {
                            name: "sftpDirt",
                            title: "home.profile.connect.sftp-dirt.title",
                            description: "home.profile.connect.sftp-dirt.description",
                            defaultValue: "/",
                            type: "text"
                        },
                        {
                            name: "forward",
                            title: "home.profile.auth.forward-type.title",
                            description: "home.profile.auth.forward-type.description",
                            defaultValue: "none",
                            type: "select",
                            options: [
                                {
                                    label: "home.profile.auth.forward-type.options.none",
                                    value: "none"
                                },
                                {
                                    label: "home.profile.auth.forward-type.options.x11",
                                    value: "x11"
                                }
                            ]
                        },
                        {
                            name: "proxy",
                            title: "home.profile.auth.proxy-type.title",
                            description: "home.profile.auth.proxy-type.description",
                            defaultValue: "none",
                            type: "select",
                            options: [
                                {
                                    label: "home.profile.auth.proxy-type.options.none",
                                    value: "none"
                                },
                                {
                                    label: "home.profile.auth.proxy-type.options.socksv5",
                                    value: "socksv5"
                                }
                            ]
                        }
                    ]
                },
                {
                    show: "(protocal == 'ssh') && (proxy == 'socksv5')",
                    title: "home.profile.auth.socksv5.title",
                    name: "socksv5",
                    items: [
                        {
                            name: "proxyHost",
                            title: "home.profile.auth.socksv5.host.title",
                            description: "home.profile.auth.socksv5.host.description",
                            defaultValue: "",
                            type: "text",
                        },
                        {
                            name: "proxyPort",
                            title: "home.profile.auth.socksv5.port.title",
                            description: "home.profile.auth.socksv5.port.description",
                            defaultValue: "1080",
                            type: "text",
                        }
                    ]
                },
                {
                    show:  "protocal == 'ssh'",
                    name: "forwardin",
                    title: "home.profile.auth.forwardin-type.title",
                    items: [
                        {
                            name: "forwardin",
                            title: "home.profile.auth.forwardin-type.title",
                            description: "home.profile.auth.forwardin-type.description",
                            defaultValue: "none",
                            type: "select",
                            options: [
                                {
                                    label: "home.profile.auth.forwardin-type.options.none",
                                    value: "none"
                                },
                                {
                                    label: "home.profile.auth.forwardin-type.options.forwardin",
                                    value: "forwardin"
                                }
                            ]
                        }
                    ]
                },
                {
                    show: "(protocal == 'ssh') && (forwardin == 'forwardin')",
                    title: "home.profile.auth.forwardin.title",
                    name: "forwardin",
                    items: [
                        {
                            name: "forwardInRemoteHost",
                            title: "home.profile.auth.forwardin.remotehost.title",
                            description: "home.profile.auth.forwardin.remotehost.description",
                            defaultValue: "localhost",
                            type: "text",
                        },
                        {
                            name: "forwardInRemotePort",
                            title: "home.profile.auth.forwardin.remoteport.title",
                            description: "home.profile.auth.forwardin.remoteport.description",
                            defaultValue: "10024",
                            type: "text",
                        },
                        {
                            name: "forwardInLocalHost",
                            title: "home.profile.auth.forwardin.localhost.title",
                            description: "home.profile.auth.forwardin.localhost.description",
                            defaultValue: "localhost",
                            type: "text",
                        },
                        {
                            name: "forwardInLocalPort",
                            title: "home.profile.auth.forwardin.localport.title",
                            description: "home.profile.auth.forwardin.localport.description",
                            defaultValue: "10024",
                            type: "text",
                        }
                    ]
                },
                {
                    show: "protocal == 'serialport'",
                    title: "home.profile.serial.title",
                    name: "serialport",
                    items: [
                        {//must first
                            name: "port",
                            title: "home.profile.serial.port.title",
                            description: "home.profile.serial.port.description",
                            defaultValue: "",
                            type: "select",
                            options: [
                                {
                                    label: "COM1",
                                    value: "COM1"
                                }
                            ],
                        },
                        {
                            name: "baudRate",
                            title: "home.profile.serial.baudRate.title",
                            description: "home.profile.serial.baudRate.description",
                            defaultValue: 115200,
                            type: "select",
                            options: [
                                {
                                    label: "110",
                                    value: 110
                                },
                                {
                                    label: "300",
                                    value: 300
                                },
                                {
                                    label: "1200",
                                    value: 1200
                                },
                                {
                                    label: "2400",
                                    value: 2400
                                },
                                {
                                    label: "4800",
                                    value: 4800
                                },
                                {
                                    label: "9600",
                                    value: 9600
                                },
                                {
                                    label: "14400",
                                    value: 14400
                                },
                                {
                                    label: "19200",
                                    value: 19200
                                },
                                {
                                    label: "38400",
                                    value: 38400
                                },
                                {
                                    label: "57600",
                                    value: 57600
                                },
                                {
                                    label: "115200",
                                    value: 115200
                                }
                            ],
                        },
                        {//must first
                            name: "dataBits",
                            title: "home.profile.serial.dataBits.title",
                            description: "home.profile.serial.dataBits.description",
                            defaultValue: 8,
                            type: "select",
                            options: [
                                {
                                    label: "5",
                                    value: 5
                                },
                                {
                                    label: "6",
                                    value: 6
                                },
                                {
                                    label: "7",
                                    value: 7
                                },
                                {
                                    label: "8",
                                    value: 8
                                }
                            ],
                        },
                        {//must first
                            name: "stopBits",
                            title: "home.profile.serial.stopBits.title",
                            description: "home.profile.serial.stopBits.description",
                            defaultValue:  1,
                            type: "select",
                            options: [
                                {
                                    label: "1",
                                    value: 1
                                },
                                {
                                    label: "2",
                                    value: 2
                                }
                            ],
                        },
                        {
                            name: "parity",
                            title: "home.profile.serial.parity.title",
                            description: "home.profile.serial.parity.description",
                            defaultValue: "none",
                            type: "select",
                            options: [
                                {
                                    label: "none",
                                    value: "none"
                                },
                                {
                                    label: "even",
                                    value: "even"
                                },
                                {
                                    label: "mark",
                                    value: "mark"
                                },
                                {
                                    label: "odd",
                                    value: "odd"
                                },
                                {
                                    label: "space",
                                    value: "space"
                                }

                            ],
                        },
                        {
                            name: "flowControl",
                            title: "home.profile.serial.flowControl.title",
                            description: "home.profile.serial.flowControl.description",
                            defaultValue: "none",
                            type: "select",
                            options: [
                                {
                                    label: "none",
                                    value: "none"
                                },
                                {
                                    label: "rtscts",
                                    value: "rtscts"
                                },
                                {
                                    label: "xon/xoff",
                                    value: "xon/xoff"
                                }
                            ],
                        }
                    ]
                },
                {
                    show: "(protocal == 'ssh') || (protocal == 'serialport') || (protocal == 'telnet') || (protocal == 'localshell')",
                    title: "home.profile.terminal.title",
                    name: "terminal",
                    items: [
                        ...XTermTheme.configItems
                    ]
                }
            ],
            profileCurSection: "base",

            emptyStates: {
                profileData: {}
            },
            currentSessionInstId: -1,
            sessionsStates: {
            }
        };
    },

    computed: {
        currentState() {
            if (this.currentSessionInstId == -1) {
                return this.emptyStates;
            }
            return this.sessionsStates[this.currentSessionInstId];
        }
    },

    created() {
    },

    mounted() {
    },

    beforeRouteUpdate(to, from, next) {
        if (to.path !== from.path) {
            this.currentSessionInstId = parseInt(to.params.id);
            this.addProfileSessionInst(this.currentSessionInstId);
        }
        next();
    },

    activated()  {
        this.currentSessionInstId = parseInt(this.$route.params.id);
        this.addProfileSessionInst(this.currentSessionInstId);
        this.$nextTick(() => {
            this.reOptions();
        })
    },
    
    methods: {
        set_config_mode(actived) {
            this.simple = actived;
        },
        addProfileSessionInst(sessId) {
            if (this.sessionsStates[sessId]) {
                return
            }

            function merge(dest, src) {
                Object.keys(src).forEach(key => {
                    if (!(key in dest)) {
                        dest[key] = src[key];
                    }
                });
                return dest;
            }

            let sessionInst = this.$sessionManager.getSessionInstanceById(sessId);
            // 尝试读取全局配置
            let globalXtermConfig = globalSetting.getProfile("xterm") || {};
            const configData = merge(sessionInst.sessionCfg.config.config, globalXtermConfig);
            this.$set(this.sessionsStates, sessId, {
                profileCurSection: "base",
                isNew: !!sessionInst.sessionCfg.config.config,
                profileData: Object.assign({
                    hostName: configData.hostName || sessionInst.sessionCfg.config.name
                }, configData)
            });
        },

        addSessionConfig() {

        },

        updateSessionConfig() {
            const sessionInst = this.$sessionManager.getSessionInstanceById(this.currentSessionInstId);
            const sessConfig = sessionInst.sessionCfg.config;

            let name = this.currentState.profileData.hostName;
            let protocal = this.currentState.profileData.protocal;
            if(protocal === 'ftp') {
                this.currentState.profileData.sessType = 'ftp';
            }
            if(protocal === 'webdav') {
                this.currentState.profileData.sessType = 'webdav';
            }
            if(protocal === 'serialport') {
                this.currentState.profileData.sessType = 'serialport';
            }
            if(protocal === 'telnet') {
                this.currentState.profileData.sessType = 'telnet';
            }
            if(protocal === 'localshell') {
                this.currentState.profileData.sessType = 'localshell';
            }

            if(protocal === 'vnc') {
                this.currentState.profileData.sessType = 'vnc';
            }
            
            if(this.currentState.profileData.cert instanceof Array) {
                this.currentState.profileData.cert = this.currentState.profileData.cert[0].data;
            } else {
                delete this.currentState.profileData['cert']
            }

            if((['ftp', 'ssh'].indexOf(protocal) >= 0) && (name == "")) {
                name = this.currentState.profileData.hostAddress;
            }
            sessConfig.update(name,
                Object.assign(sessConfig.config, this.currentState.profileData),
                ""
            );
        },

        navToSectionByName(name) {
            this.currentState.profileCurSection = name;
        },

        handleNavToSection({data}) {
            this.navToSectionByName(data.name);
        },

        handleSaveClick() {
            this.updateSessionConfig();
            const sessionInst = this.$sessionManager.getSessionInstanceById(this.currentSessionInstId);
            sessionInst.close();
        },

        doOK() {
            this.handleSaveClick()
        },

        handleSaveAndConnectClick() {
            this.updateSessionConfig();
            const sessionInst = this.$sessionManager.getSessionInstanceById(this.currentSessionInstId);
            const sessConfig = sessionInst.sessionCfg.config;
            this.$sessionManager.createSessionInstance(sessConfig);
            sessionInst.close();
        },

        async reOptions() {
            const sessionInst = this.$sessionManager.getSessionInstanceById(this.currentSessionInstId);
            let ports = await sessionInst.getSerialPorts();
            let profiles = this.profiles;
            let index = profiles.findIndex((e) => {
                return e.name === 'serialport'
            })
            let item = profiles[index];
            item.items[0].options = ports.map((e)=> {
                return {
                    label: e.path,
                    value: e.path,
                }
            });
            this.$set(this.profiles, index, item);

            //font family reset
            index = profiles.findIndex((e) => {
                return e.name === 'terminal'
            })
            item = profiles[index];
            let fontList = await this.font_list();
            if(!fontList) {
                return; 
            }
            item.items[0].options = fontList;
            this.$set(this.profiles, index, item);


        },
        async font_list() {
            const service = powertools.getService();
            let _fonts = await service.getSystemFonts();
            let fontOptions = null;
            if(_fonts) {
                fontOptions = ['default', ..._fonts].map(f => {
                    return {
                        label: f,
                        value: f
                    };
                })
            }
            return fontOptions;
        }
    }
}
</script>

<style lang="scss">
.pt-shell-profile {
    position: relative;
    background-color: var(--n-bg-color-base);
    width: 100%;
    height: 100%;

    .pt-switch {
        padding: 10px;
        display:  flex;
        justify-content: flex-end;
        align-content: center;
        align-items: center;
    }

    .pt-switch-tip {
        padding-right: 5px;
        color: var(--n-text-color-base);
    }

    .pt-row {
        height: 100%;

        .pt-col {
            position: relative;
            height: 100%;
        }
    }

    .nav-tree-container {
        padding: {top: 15px; bottom: 15px;};
        color: var(--n-text-color-base);
    }

    .profile-container {
        position: relative;
        height: calc(100% - 120px);
    }

    .pt-tree {
        .pt-tree-item {
            &:hover {
                background-color: transparent !important;
            }

            &.selected {
                background-color: transparent !important;
                .text {
                    border-radius: 3px;
                    padding-left: 2px;
                    padding-right: 2px;

                    font-weight: bold;

                    background-color: var(--primaryColor) !important;
                    color: white;
                }
            }
        }
    }

    .operator-container {
        position: absolute;
        z-index: 9999;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 120px;
        line-height: 120px;
        vertical-align: middle;
        text-align: right;
    }

    .btn-save {
        margin-right: 20px;
    }

    .btn-save-connect {
        margin-right: 60px;
    }
}
</style>