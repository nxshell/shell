import Vue from "vue";

/**
 * base functions
 */

import PtElementResizeDetector from "./base/resizedetector";
import MouseDrag from "./base/mouse";

/** install iconfont */
import "./icon/iconfont";
import PtFile from "./file/file.vue";
import PtFolder from "./folder/folder.vue";

import PtGridView from "./gridview/gridview.vue";
import PtGridViewItem from "./gridview/gridviewItem.vue";
import PtList from "./list/list.vue";
import PtMenu from "./menu/menu.vue";
import PtMenuItem from "./menu/menuitem.vue";
import PtToolbar from "./bars/toolbar.vue";
import PtXterm from "./xterm/xterm";
import PtMenuManager from "./menu/menuManager";
import PtContextMenu from "./menu/contextmenu";
import NSpace from './space/index.vue'


const components = [
    PtFile,
    PtFolder,
    NSpace,
    PtGridView,
    PtGridViewItem,
    PtList,
    PtMenu,
    PtMenuItem,
    PtToolbar,
    PtXterm
];

export default {
    components,
    install(Vue) {
        Vue.use(PtElementResizeDetector);
        Vue.use(PtMenuManager);
        Vue.use(PtContextMenu);
        Vue.use(MouseDrag);
        components.forEach((component) => {
            Vue.component(component.name, component);
        });
    }
}