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
import PtTab from "./tab/tab.vue";
import PtTabItem from "./tab/tabitem.vue";
import PtToolbar from "./bars/toolbar.vue";
import PtTree from "./tree/tree.vue";
import PtTreeItem from "./tree/treeitem";
import Pti18n from "./i18n/mixins";
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
    PtTab,
    PtTabItem,
    PtToolbar,
    PtTree,
    PtTreeItem,
    PtXterm
];

export default {
    components,
    install(Vue) {
        Vue.use(PtElementResizeDetector);
        Vue.use(PtMenuManager);
        Vue.use(PtContextMenu);
        Vue.use(MouseDrag);
        Vue.mixin(Pti18n);
        components.forEach((component) => {
            Vue.component(component.name, component);
        });
    }
}