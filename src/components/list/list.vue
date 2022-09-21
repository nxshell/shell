<template>
    <div class="pt-list">
        <ul>           
            <pt-list-item v-for="(item,idx) in items" :key="idx"
                :itemRender="itemRender"
                :item="item"
                @select="selectItem(idx)"
                @contextmenu="handleContextMenu(idx)"
            ></pt-list-item>
        </ul>
    </div>
</template>

<script>
import PtListItem from "./listitem.js";

export default {
    name: "PtList",
    components: {
        PtListItem
    },
    props: {
        listData: {
            type: Array,
            default() {
                return [];
            }
        },
        dataKey: {
            type: String,
            required: true
        },
        multiSelect: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            itemIndex: {},
            items: [],
            itemRender: null
        };
    },

    watch: {
        listData() {
            this.prepareListData();
        }
    },

    computed: {
        selectedItems() {
            return this.items.filter((item) => {
                if (item.selected) {
                    return item;
                }
            }).map(item => item.data)
        }
    },

    created() {
        this.prepareListData();
    },
    mounted() {
        this.itemRender = this.$scopedSlots.default;
    },

    methods: {
        /**
         * 准备列表数据
         * 如果数据已经存在，则更新数据项目，不存在则添加数据项目
         */
        prepareListData() {
            let newKeys = new Set([]);
            this.listData.forEach((item) => {
                let key = item[this.dataKey];
                let indexedItem = this.itemIndex[key]
                if (indexedItem) {
                    // 更新数据
                    Object.assign(indexedItem.data, item);
                } else {
                    // 添加新的项目
                    indexedItem = {
                        selected: false,
                        data: Object.assign({}, item)
                    };

                    this.itemIndex[key] = indexedItem;
                    this.items.push(indexedItem);
                }
                newKeys.add(key);
            });
            // 查找已经删除的数据，从索引中移除掉
            let oldIndexKeys = Object.keys(this.itemIndex);
            oldIndexKeys.forEach((oldKey) => {
                if (!newKeys.has(oldKey)) {
                    delete this.itemIndex[oldKey];
                }
            });

            this.$forceUpdate();
        },

        selectItem(idx) {
            if (this.multiSelect) {
                this.items[idx].selected = !this.items[idx].selected;
            } else {
                this.items.forEach((item, itemIdx) => {
                    if (itemIdx === idx) {
                        item.selected = !item.selected;
                    } else {
                        item.selected = false;
                    }
                });
            }

            this.$emit("selectItems", this.selectedItems);
        },
        handleContextMenu(idx) {
            this.$emit("contextmenu", {
                item: this.items[idx],
                index: idx
            });
        }
    }
}
</script>

<style lang="scss">
@import "@/assets/scss/_const.scss";

.pt-list {
    overflow-y: scroll;

    ul {
        box-sizing: content-box;
        border: solid 1px var(--borderColor);
    }

    .pt-list-item {
        position: relative;
        box-sizing: content-box;
        cursor: default;

        padding: {
            left: 5px;
            right: 5px;
        }

        height: $listItemHeight;
        line-height: $listItemHeight;

        &:hover {
            background-color: var(--hoverItemColor);
        }

        &.selected {
            background-color: var(--highlightItemColor);
        }
    }
}
</style>