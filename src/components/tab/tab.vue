<template>
    <div class="pt-tab">
        <scroll-container type="horizontal" :size="2">
            <pt-tab-item v-for="(tabItem, idx) in tabs" :key="idx"
                :icon="tabItem.icon"
                :title="translate ? T(tabItem.title) : tabItem.title"
                :selected="idx == currentTab"
                :showSplit="(idx != currentTab) && (idx + 1 != currentTab) && (idx != tabs.length - 1) && (!flat)"
                :hideClose="hideClose"
                @click="handleClick(idx)"
                @close="handleClose(idx)"
                @contextmenu="handleContextMenu(idx)"
            />
        </scroll-container>
    </div>
</template>

<script>
import ScrollContainer from "../base/scrollcontainer";

export default {
    name: "PtTab",
    components: {
        ScrollContainer
    },
    props: {
        tabs: {
            type: Array,
            default() {
                /**
                 * {
                 *     icon: 'iconName',
                 *     title: 'title',
                 *     data: any
                 * }
                 */
                return [];
            }
        },
        activeIndex: {
            type: Number,
            default: 0
        },
        flat: {
            type: Boolean,
            default: false
        },
        hideClose: {
            type: Boolean,
            default: false
        },
        translate: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            currentTab: -1
        };
    },

    watch: {
        tabs() {
            if (this.currentTab >= this.tabs.length) {
                this.currentTab = this.tabs.length - 1;
            }
        },
        activeIndex(newVal) {
            if (newVal != this.currentTab) {
                this.handleClick(newVal);
            }
        }
    },

    created() {
        this.currentTab = this.activeIndex;
    },

    methods: {
        handleClick(idx) {
            this.currentTab = idx;
            this.$emit("activate", idx);
        },
        handleClose(idx) {
            this.$emit("remove", idx);
        },
        handleContextMenu(idx) {
            this.$emit("contextmenu", idx)
        }
    }
}
</script>

<style lang="scss">
.pt-tab {
    position: relative;
    box-sizing: border-box;
    height: 34px;

    overflow: hidden;

    background-color: var(--backgroundColor);
    border-bottom: solid 2px var(--primaryColor);
}
</style>
