import Vue from 'vue';

import {showContextMenu} from "./contextmenu";

const menuStack = [];

let lastMenuId = 0;
const contextMenuHandlers = {};

export function getLastMenuId() {
    return lastMenuId++;
}

function addContextMenuHandler(ctxMenuId, handler) {
    contextMenuHandlers[ctxMenuId] = handler;
    return handler;
}

function removeContextMenuHandler(ctxMenuId) {
    if (contextMenuHandlers[ctxMenuId]) {
        delete contextMenuHandlers[ctxMenuId];
    }
}

const contextMenuDirective = {
    bind (el, binding, vnode) {
        const ctxMenuId = getLastMenuId();
        const handler = addContextMenuHandler(ctxMenuId, async function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            // 不管三七二十一，只要触发右键菜单，之前所有的菜单全部关闭掉
            // 对！！就这么豪横~
            closeAllMenu();

            /**
             * 允许绑定
             */
            let menu;
            if (typeof binding.value === "function") {
                menu = binding.value();
            } else {
                menu = binding.value;
            }

            if (menu && typeof menu.then === "function") {
                menu = await menu;
            }

            showContextMenu(menu, evt);
        });
        el.addEventListener("contextmenu", handler);
        el.dataset.contextMenuId = ctxMenuId;
    },
    unbind(el, binding, vnode) {
        const ctxMenuId = el.dataset.contextMenuId;
        el.removeEventListener('contextmenu', contextMenuHandlers[ctxMenuId], true);
        removeContextMenuHandler(ctxMenuId);
    }
};

function closeAllMenu() {
    if (menuStack.length) {
        menuStack[0].$emit("pop-stack");
        menuStack.splice(0);
    }
}

function initDefaultMenuHandler() {
    document.addEventListener("mousedown", (evt) => {
        if (menuStack.length > 0) {
            closeAllMenu();
        }
        // setTimeout(() => {

        // }, 100);
    }, true);

    // window.addEventListener("contextmenu", (evt) => {
    //     closeAllMenu();
    // })

    window.addEventListener("blur", (evt) => {
        closeAllMenu();
    });
}

export function pushMenu(menuInst) {
    let stackTop = menuStack[menuStack.length - 1];
    if (menuInst === stackTop) {
        return;
    }
    menuStack.push(menuInst);
}

export function popMenu(initiator) {
    let stackTop = menuStack[menuStack.length - 1];
    if (stackTop === initiator) {
        return;
    }
    menuStack.pop()
    if (stackTop) {
        stackTop.$emit("pop-stack")
    }
}

export default {
    install() {
        initDefaultMenuHandler();

        Vue.directive('contextMenu', contextMenuDirective);
    }
}