/**
 * 节点能力
 */
const NODES_CAPS = {
    // 终端
    TERMINAL: 1,
    // 图形界面
    GUI: 2,
    // 文件系统
    FS: 4,
    // 网络
    NET: 8,
    // 用户及组
    USERS: 16
};

const PROTOCOLS = {
    SSH: "SSH",
    SSH2: "SSH2",
    FTP: "FTP",
    WEBDAV: "WEBDAV",
    RDP: "RDP",
    VNC: "VNC",
    SERIALPORT: "SERIALPORT",
    LOCAL: "LOCAL",
    TELNET: 'TELNET',
    LOCALSHELL: 'LOCALSHELL'
};

/**
 * 协议支持能力映射
 */
const PROTOCOL_CAPS_MAP = {
    // SSH2协议,SSH默认为SSH2
    SSH: NODES_CAPS.TERMINAL | NODES_CAPS.GUI | NODES_CAPS.FS | NODES_CAPS.NET | NODES_CAPS.USERS,
    SSH2: NODES_CAPS.TERMINAL | NODES_CAPS.GUI | NODES_CAPS.FS | NODES_CAPS.NET | NODES_CAPS.USERS,
    // FTP协议
    FTP: NODES_CAPS.FS,
    // WEBDAV(HTTP)
    WEBDAV: NODES_CAPS.FS,
    // RDP协议
    RDP: NODES_CAPS.GUI,
    // VNC协议
    VNC: NODES_CAPS.GUI,
    // 串口
    SERIALPORT: NODES_CAPS.TERMINAL,
    // Telnet
    TELNET: NODES_CAPS.TERMINAL,
    // local shell
    LOCALSHELL: NODES_CAPS.TERMINAL,
    LOCAL: NODES_CAPS.TERMINAL | NODES_CAPS.FS
};

/**
 * 终端特征
 */
const TERMINAL_FEATURES = {
    // VT100终端
    VT100: 1,
    // XTERM终端
    XTERM: 2,
    // LINUX终端
    LINUX: 4
};

const GUI_FEATURES = {
    // 支持X11协议
    X11: 1,
    // 支持RDP协议
    RDP: 2,
    // 支持VNC协议
    VNC: 4
};

const FS_FEATURES = {
    OPEN: 1,
    CLOSE: 2,
    READ: 4,
    WRITE: 8,
    FSTAT: 16,
    FSETSTAT: 32,
    FUTIMES: 64,
    FCHOWN: 128,
    FCHMOD: 256,
    OPENDIR: 512,
    READDIR: 1024,
    UNLINK: 2048,
    RENAME: 4096,
    MKDIR: 8192,
    RMDIR: 16384,
    STAT: 32768,
    LSTAT: 65536,
    SETSTAT: 1 << 17,
    UTIMES: 1 << 18,
    CHOWN: 1 << 19,
    CHMOD: 1 << 20,
    READLINK: 1 << 21,
    SYMLINK: 1 << 22,
    REALPATH: 1 << 23
};

const NET_FEATURES = {
    FORWARD_IN: 1,
    FORWARD_OUT: 2,
    TUNNEL: 4
};


module.exports = {
    NODES_CAPS,
    PROTOCOLS,
    PROTOCOL_CAPS_MAP,
    TERMINAL_FEATURES,
    GUI_FEATURES,
    FS_FEATURES,
    NET_FEATURES
};
