<template>
    <div class="pt-view" :style="posStyle">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "PtView",
    props: {
        viewId: {
            type: Number,
            default: -1
        }
    },

    data() {
        return {
            currentSize: {left: 0, top: 0, width: 0, height: 0}
        }
    },

    inject: ["getViewRect"],

    computed: {
        posStyle() {
            let style = {};
            Object.keys(this.currentSize).forEach((key) => {
                let val = this.currentSize[key];
                style[key] = val == 0 ? 0: val + "px";
            });
            return style;
        }
    },

    created() {

    },

    mounted() {

    },
    methods: {
        resize() {
            let rect = this.getViewRect(this.viewId);
            this.currentSize = rect;
        }
    }
}
</script>

<style lang="scss">
.pt-view {
    position: absolute;

    width: 100%;
    height: 100%;
}
</style>