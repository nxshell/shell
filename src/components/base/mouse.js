
let mouseDragId = 0;

function getMouseDragId() {
    return mouseDragId++;
}

const registerDragElement = Object.create(null);
let currentElement = null;

function addDragElement(id, el, handlers) {
    registerDragElement[id] = {
        el,
        handlers,
        mouseInfo: {
            drag: false,
            x: 0,
            y: 0,
            oldX: 0,
            oldY: 0
        }
    };
}

function removeDragElement(id) {
    delete registerDragElement[id];
}

function getDragElement(id) {
    return registerDragElement[id];
}

function getEventInfo(el) {
    if (!el.dataset) {
        return;
    }
    const dragId = el.dataset.dragId;
    if (!dragId) {
        return null;
    }
    const dragEleInfo = getDragElement(dragId);
    if (!dragEleInfo) {
        return null;
    }
    return dragEleInfo;
}

function traceback(evt, cb) {
    let el = currentElement || evt.target;
    while (el) {
        let info = getEventInfo(el);
        if (info) {
            let ret = cb(info);
            if (ret) {           
                break;
            }
        }
        el = el.parentNode;
    }
}

document.addEventListener("mousedown", (evt) => {
    if (evt.button != 0 ) {
        return;
    }
    if (currentElement == null) {
        currentElement = evt.target;
    }

    traceback(evt, (evtInfo) => {
        const handlers = evtInfo.handlers;
        const mouseInfo = evtInfo.mouseInfo;
        
        mouseInfo.drag = true;

        mouseInfo.x = evt.clientX;
        mouseInfo.y = evt.clientY;
        mouseInfo.oldX = evt.clientX;
        mouseInfo.oldY = evt.clientY;
        if (handlers.dragStart) {
            return handlers.dragStart({x: mouseInfo.x, y: mouseInfo.y});
        }
    })
    
});

document.addEventListener("mousemove", (evt) => {
    traceback(evt, (evtInfo) => {
        const handlers = evtInfo.handlers;
        const mouseInfo = evtInfo.mouseInfo;

        if (!mouseInfo.drag) {
            return;
        }

        mouseInfo.x = evt.clientX;
        mouseInfo.y = evt.clientY;
        const movementX = mouseInfo.x - mouseInfo.oldX;
        const movementY = mouseInfo.y - mouseInfo.oldY;
        mouseInfo.oldX = evt.clientX;
        mouseInfo.oldY = evt.clientY;
        if (handlers.dragMove) {
            return handlers.dragMove({x: mouseInfo.x, y: mouseInfo.y, movementX, movementY});
        }
    })
});

document.addEventListener("mouseup", (evt) => {
    const curInfo = getEventInfo(currentElement || evt.target);
    if (curInfo) {
        if (curInfo.handlers.dragEnd) {
            curInfo.handlers.dragEnd({x: evt.clientX, y: evt.clientY})
        }
        curInfo.mouseInfo.drag = false;
    }
    currentElement = null;
    traceback(evt, (evtInfo) => {
        const handlers = evtInfo.handlers;
        const mouseInfo = evtInfo.mouseInfo;

        mouseInfo.drag = false;

        if (handlers.dragEnd) {
            return handlers.dragEnd({x: evt.clientX, y: evt.clientY});
        }
    });
});

const mouseDirective = {
    bind(el, binding) {
        const dragId = getMouseDragId();
        addDragElement(dragId, el, binding.value);
        el.dataset.dragId = dragId;
    },

    unbind(el, binding) {
        const dragId = el.dataset.dragId;
        removeDragElement(dragId);
    }
}

export default {
    install(Vue) {
        Vue.directive("mouse-drag", mouseDirective);
    }
}