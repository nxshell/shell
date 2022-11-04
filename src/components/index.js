import Vue from "vue";

/**
 * base functions
 */

import PtElementResizeDetector from "./base/resizedetector";
import MouseDrag from "./base/mouse";

import PtAvatar from "./avatar/avatar.vue";

import PtForm from "./form/form.vue";
import PtFormItem from "./form/formitem.vue";

/** install iconfont */
import "./icon/iconfont";
import PtIcon from "./icon/icon.vue";

import PtButton from "./button/button.vue";
import PtFile from "./file/file.vue";
import PtFolder from "./folder/folder.vue";
import PtCol from "./layout/col.vue";
import PtInputbox from "./inputbox/inputbox.vue";
import PtRow from "./layout/row.vue";
import PtSplitView from "./layout/splitview.vue";
import PtView from "./layout/view.vue";

import PtGridView from "./gridview/gridview.vue";
import PtGridViewItem from "./gridview/gridviewItem.vue";

import PtList from "./list/list.vue";
import PtSwitchButton from "./switch/switch.vue";

import PtMenu from "./menu/menu.vue";
import PtMenuItem from "./menu/menuitem.vue";

import PtProgress from "./progress/progress.vue";

import PtSelect from "./select/select.vue";
import PtSelectOption from "./select/selectoption.vue";

import PtTab from "./tab/tab.vue";
import PtTabItem from "./tab/tabitem.vue";

import PtToolbar from "./bars/toolbar.vue";
import PtStatusBar from "./bars/statusbar.vue";
import PtStatusBarItem from "./bars/statusbaritem.vue";

import PtTree from "./tree/tree.vue";
import PtTreeItem from "./tree/treeitem";

import PtWindow from "./window/window.vue";
import PtDialog from "./window/dialog.vue";
import PtConfirm from "./window/confirm";

import Pti18n from "./i18n/mixins";

import PtXterm from "./xterm/xterm";

import PtMenuManager from "./menu/menuManager";
import PtContextMenu from "./menu/contextmenu";
import NSpace from './space/index.vue'


const components = [
    PtAvatar,

    PtButton,

    PtFile,
    PtFolder,

    PtForm,
    NSpace,
    PtFormItem,

    PtGridView,
    PtGridViewItem,

    PtIcon,
    PtInputbox,

    PtCol,
    PtRow,
    PtSplitView,
    PtView,

    PtList,
    PtSwitchButton,

    PtMenu,
    PtMenuItem,

    PtProgress,

    PtSelect,
    PtSelectOption,

    PtTab,
    PtTabItem,

    PtToolbar,
    PtStatusBar,
    PtStatusBarItem,

    PtTree,
    PtTreeItem,

    PtDialog,
    PtWindow,

    PtXterm
];

export default {
    components,
    install(Vue) {
        Vue.use(PtElementResizeDetector);
        Vue.use(PtMenuManager);
        Vue.use(PtContextMenu);
        Vue.use(PtConfirm);
        Vue.use(MouseDrag);
        Vue.mixin(Pti18n);
        components.forEach((component) => {
            Vue.component(component.name, component);
        });
    }
}