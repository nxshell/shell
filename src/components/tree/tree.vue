<template>
	<div class="pt-tree" :class="classList">
		<pt-tree-item
			v-for="(node, idx) in renderData"
			:key="idx"
			:level="level"
			:draggable="draggable"
			:nodeData="node"
			:treeRoot="treeRoot || this"
			:isFolder="!!node.children"
			:autoExpanded="autoExpanded"
			:innerPath="innerPath + '/' + idx"
			:iconFilter="iconFilter"
			:nodeStates="nodeStates"
			:dataKey="dataKey"
			:additionalRender="additionalRender || addRender"
			@tree-node-select="selectNode($event, idx)"
			@tree-node-open="handleTreeNodeOpen"
			@move-node="handleMoveNode"
			@append="appendNode($event, idx)"
			@remove="removeNode(idx)"
			@contextmenu="handleContextMenu"
			@state-change="handleStateChange"
		/>
	</div>
</template>

<script>
import { processTreeNodes, getDataKeyFunc } from "./treeNode";
import { insert } from "../../../common/utils";

export default {
	name: "PtTree",
	props: {
		treeData: {
			type: Array,
			default() {
				return [];
			}
		},
		isRoot: {
			type: Boolean,
			default: true
		},
		level: {
			type: Number,
			default: 0
		},
		draggable: {
			type: Boolean,
			default: false
		},
		additionalRender: {
			type: Function
		},
		autoExpanded: {
			type: Boolean,
			default: false
		},
		innerPath: {
			type: String,
			default: ""
		},
		treeRoot: {
			type: Object,
			default() {
				return null;
			}
		},
		/**
		 * iconFilter
		 * iconFilter(isFolder, data)
		 */
		iconFilter: Function,

		className: "",
		// TODO: add lazy load code here
		showBorder: false,
		nodeStates: {
			type: Object,
			default() {
				return null;
			}
		},
		dataKey: {
			type: String,
			default: ""
		}
	},
	data() {
		return {
			renderData: [],
			addRender: null
		};
	},

	watch: {
		treeData() {
			this.processRenderData();
		}
	},

	computed: {
		classList() {
			if (!this.isRoot) {
				return [];
			}
			let classList = [];
			if (this.showBorder) {
				classList.push('pt-tree-border');
			}
			if (this.className) {
				classList.push(this.className);
			}

			return classList;
		}
	},

	created() {
		this.processRenderData();
	},

	mounted() {
		this.addRender = this.$scopedSlots.additional;
	},

	methods: {
		processRenderData() {
			if (!this.isRoot) {
				this.renderData = this.treeData;
				return
			}

			this.renderData = processTreeNodes(this.treeData, this.autoExpanded, this.nodeStates, this.dataKey);
		},

		/**
		 * 追加节点
		 * @param {Object} node 插入节点信息
		 * @param {Object} node.treeData 数节点数据
		 * @param {String} [node.pos] 在当前节点的位置
		 * @param {Number} index 当前节点的位置
		 */
		appendNode({ treeData, pos }, index) {
			let insertPos = undefined;
			index = typeof index == "number" ? index : this.renderData.length - 1;
			if (pos === "before") {
				insertPos = index;
			} else {
				insertPos = index + 1;
			}
			const treeDataNode = processTreeNodes([treeData])[0];
			this.renderData = insert(this.renderData, treeDataNode, insertPos);
			this.$emit("tree-node-data-change", this.renderData);
		},

		/**
		 * 移除一个节点
		 * @param {Number} index 移除的节点索引
		 */
		removeNode(index) {
			this.renderData.splice(index, 1);
		},

		walkNodesAndSet(value, excludeNodePath) {
			const walkAndSet = (nodes, path) => {
				for (let i = 0; i < nodes.length; i++) {
					const node = nodes[i];
					const curPath = `${ path }/${ i }`;
					if (curPath !== excludeNodePath) {
						node.selected = value;
					}

					if (node.children) {
						walkAndSet(node.children, curPath);
					}
				}
			}

			walkAndSet(this.renderData, "");
		},

		handleStateChange() {
			if (!this.isRoot) {
				this.$emit("state-change");
				return;
			}
			const newStates = Object.create(null);
			const readDataKey = getDataKeyFunc(this.dataKey);
			const walk = (nodes) => {
				nodes.forEach(node => {
					const stateKey = readDataKey(node.data);
					newStates[stateKey] = {
						selected: node.selected
					}
					if ("expanded" in node) {
						newStates[stateKey].expanded = node.expanded;
					}

					if (node.children) {
						walk(node.children);
					}
				})
			}

			walk(this.renderData);

			this.$emit("update:nodeStates", newStates)
		},

		selectNode({ data, node, multi, contextmenu }, idx) {
			if (this.isRoot && !multi) {
				// 只有到达树的根的时候，并且非多选项，才进行树所有的节点遍历及值的设置
				this.walkNodesAndSet(false, node.innerPath);
			}

			// 树的跟节点，并且是contextmenu触发，则不向父级传递
			if (this.isRoot && contextmenu) {
				return;
			}

			this.$emit("tree-node-select", { data, node, multi, contextmenu });
		},

		handleTreeNodeOpen(evt) {
			this.$emit("tree-node-open", evt);
		},

		handleContextMenu(context) {
			this.$emit("contextmenu", context);
		},

		handleMoveNode(evt) {
			this.$emit("move-node", evt);
		},

		clearSelection() {
			this.walkNodesAndSet(false, "");
		}
	}
}
</script>

<style lang="scss">
@import "@/assets/scss/_const.scss";

.pt-tree {
	position: relative;
	box-sizing: content-box;

	&.pt-tree-border {
		border: solid 1px var(--borderColor);
	}

	.pt-tree-item {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		cursor: default;
		padding: 0 10px;
		height: $listItemHeight;
		line-height: $listItemHeight;
		user-select: none;

		.pt-icon-wrapper {
			margin-right: 5px;
		}

		&:hover {
			cursor: pointer;
			background-color: var(--n-hover-bg-color);
		}

		&.selected {
			background-color: var(--n-hover-bg-color);
		}

		.text {
			display: inline-block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&.insert {
			&.before {
				&::before {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
					height: 1px;
					content: ' ';
				}
			}

			&.after {
				&::after {
					position: absolute;
					left: 0;
					bottom: 0;
					width: 100%;
					height: 1px;
					content: ' ';
				}
			}

			&.this-node {
				background-color: var(--treeNodeInsertCurrentColor);
			}

			&.before {
				// border-top: solid 1px $primaryColor;
				&::before {
					background-color: var(--primaryColor);
				}
			}

			&.after {
				// border-bottom: solid 1px $primaryColor;
				&::after {
					background-color: var(--primaryColor);
				}
			}
		}
	}

	.nx-menu-folder {
		.pt-tree {
			padding-left: 15px;

			.nx-menu-item {
				padding-right: 0;
			}
		}

	}
}
</style>