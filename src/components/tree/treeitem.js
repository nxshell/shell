import { insert } from "../../../common/utils";
import { processTreeNodes } from "./treeNode";

const treeNodeTransfer = {
    data: {}, setData(key, data) {
        this.data[key] = data;
    }, getData(key) {
        return this.data[key];
    }, clear() {
        this.data = {};
    }
};

export default {
    name: "PtTreeItem", props: {
        level: {
            type: Number, default: 0
        }, nodeData: {
            type: Object, required: true
        }, isFolder: {
            type: Boolean, default: false
        }, draggable: {
            type: Boolean, default: false
        }, additionalRender: {
            type: Function
        }, autoExpanded: {
            type: Boolean, default: false
        }, treeRoot: {
            type: Object
        }, innerPath: {
            type: String,
        }, iconFilter: Function, nodeStates: Object, dataKey: String
    }, data() {
        return {
            insert: false, insertType: "", hover: false
        };
    },

    computed: {
        selected: {
            get() {
                return this.nodeData.selected;
            }, set(newValue) {
                return this.nodeData.selected = newValue;
            }
        }, expanded: {
            get() {
                return this.nodeData.expanded;
            }, set(newValue) {
                return this.nodeData.expanded = newValue;
            }
        }, _nodeData() {
            return this.nodeData.data;
        },

        iconProp() {
            let prop = {
                type: "svg",
            };
            // FIXME: 目录页是可以使用自定义图标
            if (this.isFolder) {
                prop.iconName = this.expanded ? "file-open" : "folder-close";
                return prop;
            }

            if (typeof this.iconFilter === "function") {
                let icon = this.iconFilter(this._nodeData, this.isFolder, this.expanded);
                if (typeof icon === "string") {
                    prop.iconName = icon;
                } else if (typeof icon === "object") {
                    prop.type = icon.type ? icon.type : "svg";
                    prop.iconName = icon.iconName ? icon.iconName : undefined;
                }
            }

            return prop;
        }, height() {
            return parseInt(window.getComputedStyle(this.$el).height) || 0;
        }
    },

    created() {
    },

    mounted() {
    },

    methods: {
        emit({ data, node, multi, contextmenu }) {
            this.$emit("tree-node-select", { data, node, multi, contextmenu });
            this.$emit("state-change");
        },
        selectItem(evt, contextmenu = false) {
            if (contextmenu) {
                this.selected = true;
                this.emit({ data: this._nodeData, node: this, multi: false, contextmenu })
                return;
            }
            if (evt.ctrlKey) {
                this.selected = !this.selected;
            } else {
                this.selected = true;
            }

            if (!evt.ctrlKey) {
                this.expanded = !this.expanded;
            }

            this.emit({ data: this._nodeData, node: this, multi: evt.ctrlKey });
            evt.stopPropagation();
        },
        handleDblClick() {
            this.$emit("tree-node-open", { data: this._nodeData })
        },

        handleTreeNodeOpen(data) {
            this.$emit("tree-node-open", data);
        },

        onSubTreeItemSelected({ data, node, multi, contextmenu }) {
            this.emit({ data, node, multi, contextmenu });
        },

        onTreeNodeDataChange(subTreeList) {
            this.nodeData.children = subTreeList;
        },

        resetInsert() {
            this.insert = false;
            this.insertType = "";
        },

        onDragstart(evt) {
            evt.dataTransfer.effectAllowed = "move";
            evt.dataTransfer.setData("ptTreeItemObject", this.innerPath);
            treeNodeTransfer.setData(this.innerPath, this);
            treeNodeTransfer.setData("ptTreeItemObjectPath", this.innerPath)
            if (this.isFolder) {
                this.expanded = false
            }
        },

        onDragenter(evt) {
            this.insert = true;
            this.insertType = "";
            const dragPath = treeNodeTransfer.getData("ptTreeItemObjectPath")
            /** 如果是目录，并且不是拖动本身的话，自动展开目录 */
            if (this.isFolder && this.expanded === false && (dragPath !== this.innerPath)) {
                this.expanded = true;
            }
        }, onDragleave(evt) {
            this.resetInsert();
        },

        onDragover(evt) {
            evt.preventDefault();
            if (this.isFolder) {
                this.insertType = "thisNode";
                return;
            }

            if (evt.offsetY < this.height / 2) {
                this.insertType = "before";
            } else {
                this.insertType = "after";
            }
        },

        onDragdrop(evt) {
            evt.preventDefault();
            const putNodePath = evt.dataTransfer.getData("ptTreeItemObject")
            if (!putNodePath) {
                this.resetInsert();
                return;
            }

            const putNode = treeNodeTransfer.getData(putNodePath);
            treeNodeTransfer.clear();
            if (putNodePath === this.innerPath) {
                this.resetInsert();
                return;
            }
            putNode.remove()

            const { nodeData } = putNode
            if (this.isFolder) {
                this.appendChild(nodeData.data)
            } else {
                this.appendSibling(nodeData.data, this.insertType)
            }

            this.$emit("move-node", {
                dest: this.nodeData.data.data,
                destPosition: this.isFolder ? "parent" : this.insertType,
                source: nodeData.data.data
            });

            this.resetInsert();
        },

        onMoveNode(evt) {
            this.$emit("move-node", evt);
        },

        onContextMenu(evt) {
            if (evt instanceof Event) {
                evt.preventDefault();
                this.selectItem(null, true);
                this.$emit("contextmenu", { data: this._nodeData, node: this });
            } else {
                this.$emit("contextmenu", evt);
            }
        },

        handleStateChange() {
            this.$emit("state-change");
        },

        handleMouseEnter() {
            this.hover = true;
        },

        handleMouseLeave() {
            this.hover = false;
        },

        getParentNode() {
            if (this.$parent && this.$parent.isRoot) {
                return null;
            } else {
                return this.$parent.$parent;
            }
        },

        /**
         * 添加子节点
         * @param {Object} nodeData 节点数据
         * @param {Number} [pos]  节点位置
         */
        appendChild(nodeData) {
            const treeData = processTreeNodes([nodeData], false, this.nodeStates, this.dataKey)[0];
            this.nodeData.children = insert(this.nodeData.children, treeData)
        },

        /**
         * 添加兄弟节点
         *
         * @param {Object} nodeData 节点数据
         * @param {String} [pos] 位置：before | after， 不设置追加到最后
         */
        appendSibling(nodeData, pos) {
            const treeData = processTreeNodes([nodeData], false, this.nodeStates, this.dataKey)[0];
            this.$emit("append", {
                treeData, pos
            });
        }, /**
         * 删除自己
         */
        remove() {
            this.$emit("remove");
        }
    },

    render(createElement) {
        // 图标和标题
        const renderItem = [createElement("n-icon", {
            props: {
                name: this.iconProp.iconName, type: this.iconProp.type
            }
        }), createElement("span", {
            "class": {
                text: true
            }
        }, this.T(this._nodeData.text))];

        // 包裹图标和标题 为后面flex布局做准备
        const nxMenuItemWrapper = [createElement('span', {
            style: {
                display: 'flex', 'justify-content': 'flex-start', 'align-items': 'center'
            }
        }, renderItem)]
        if (!this.isFolder && this.additionalRender && this.hover) {
            nxMenuItemWrapper.push(this.additionalRender(this._nodeData));
        }
        let dragHandlers = {};
        if (this.draggable) {
            dragHandlers.dragstart = this.onDragstart;
            dragHandlers.dragenter = this.onDragenter;
            dragHandlers.dragleave = this.onDragleave;
            dragHandlers.dragover = this.onDragover;
            dragHandlers.drop = this.onDragdrop;
        }

        const renderList = [createElement("div", {
            class: {
                "pt-tree-item": true,
                "selected": this.selected,
                "insert": this.insert,
                "this-node": this.insertType === "thisNode",
                "before": this.insertType === "before",
                "after": this.insertType === "after"
            }, style: {
                // paddingLeft: (10 + 15 * this.level) + "px"
            }, attrs: {
                draggable: true, // title: this.T(this._nodeData.text)
            }, on: {
                click: this.selectItem, dblclick: this.handleDblClick, contextmenu: this.onContextMenu, // 'move-node': this.onMoveNode,
                ...dragHandlers, "mouseenter": this.handleMouseEnter, "mouseleave": this.handleMouseLeave
            }
        }, nxMenuItemWrapper)];

        if (this.nodeData.children && this.nodeData.children.length && this.expanded) {
            renderList.push(createElement("pt-tree", {
                props: {
                    treeData: this.nodeData.children,
                    isRoot: false,
                    level: this.level + 1,
                    draggable: this.draggable,
                    additionalRender: this.additionalRender,
                    treeRoot: this.treeRoot,
                    innerPath: this.innerPath,
                    iconFilter: this.iconFilter,
                    nodeStates: this.nodeStates,
                    dataKey: this.dataKey
                }, on: {
                    "tree-node-select": this.onSubTreeItemSelected,
                    "tree-node-open": this.handleTreeNodeOpen,
                    "tree-node-data-change": this.onTreeNodeDataChange,
                    "move-node": this.onMoveNode,
                    contextmenu: this.onContextMenu,
                    "state-change": this.handleStateChange
                }
            }));
        }

        return createElement("div", { class: { 'nx-menu-item': true, "nx-menu-folder": this.isFolder } }, renderList);
    }
};
