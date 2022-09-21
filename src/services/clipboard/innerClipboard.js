/**
 * 内部剪切板
 * 剪切、复制、粘贴
 */

const clipboardStore = {
    text: {
        value: "",
        action: ""
    },
    object: {
        value: null,
        action
    }
};

export function writeText(text) {
    clipboardStore.text = text;
}

export function readText() {
    return clipboardStore.text;
}