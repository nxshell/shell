
let isInitialize = false;

const shortcutIndex = {
    ctrl: {
        shift: {},
        alt: {}
    },
    alt: {
        shift: {}
    },
    // TODO: MacOS
    command: {
        shift: {}
    },
    meta: {}
}

function isFuncKey(key) {
    return key === "ctrl" || key === "alt" || key === "shift";
}

function registerShortcut(keyCombination, handler) {
    if (!keyCombination || typeof handler !== "function") {
        return;
    }

    const keys = keyCombination.split("+").map(keyName => keyName.trim().toLowerCase())
    if (keys.length < 2) {
        return;
    }
    // TODO: 添加MacOS支持
    if (key[0] !== "ctrl" || key[0] !== "alt" || key[0]) {
        return;
    }
}

function initShortcut() {
    if (isInitialize) {
        return;
    }
    window.addEventListener("keydown", (e) => {

    });

    isInitialize = true;
}

export default {
    install(Vue) {
        initShortcut();
        Vue.prototype.registerShortcut = registerShortcut;
    }
}