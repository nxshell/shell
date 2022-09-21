import Vue from "vue";

import PtTree from "./tree.vue";
import PtTreeItem from "./treeitem";

export default {
    install() {
        Vue.component(PtTree.name, PtTree);
        Vue.component(PtTreeItem.name, PtTreeItem);
    }
};