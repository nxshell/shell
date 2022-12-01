import arch from "../assets/sysicons/arch.png";
import centos from "../assets/sysicons/centos.png";
import debian from "../assets/sysicons/debian.png";
import deepin from "../assets/sysicons/deepin.png";
import kali from "../assets/sysicons/kali.png";
import linux from "../assets/sysicons/linux.png";
import redhat from "../assets/sysicons/redhat.png";
import suse from "../assets/sysicons/suse.png";
import ubuntu from "../assets/sysicons/ubuntu.png";
import ubuntukylin from "../assets/sysicons/ubuntukylin.png";
import oracle from "../assets/sysicons/oracle.png";
import fedora from "../assets/sysicons/fedora.png";
import vnc from "../assets/sysicons/vnc.png"

import nxshell from "../assets/logo.png";

export function getSystemIcon(system) {
    const normalizeName = /^([a-zA-Z]+)/.exec(system);
    if (!normalizeName) {
        return linux;
    }

    return {
        arch, centos, debian, deepin, kali, redhat, suse, ubuntu, ubuntukylin, oracle, fedora
    }[normalizeName[0]] || linux;
}

export function treeIconFilter(nodeData) {
    let config = nodeData.data && nodeData.data.config
    if (!config) {
        config = nodeData.config
    }
    const osType = config?.osType || 'linux'
    const icon = getSystemIcon(osType);

    return {
        type: "img",
        iconName: icon
    };
}

export function getSessionIcon(sessionType) {
    if (sessionType === "welcome") {
        return nxshell;
    } else if (sessionType === "vnc") {
        return vnc;
    } else {
        return null;
    }
}