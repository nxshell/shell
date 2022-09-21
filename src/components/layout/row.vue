<template>
    <div class="pt-row" :style="style">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "PtRow",
    props: {
        gutter: {
            type: Number,
            default: 0
        }
    },

    computed: {
        style() {
            if (this.gutter == 0) {
                return {};
            }
            return {
                marginLeft: `-${this.gutter / 2}px`,
                marginRight: `-${this.gutter / 2}px`
            };
        },
        childStyle() {
            if (this.gutter == 0) {
                return {}
            }
            return {
                paddingLeft: `${this.gutter / 2}px`,
                paddingRight: `${this.gutter / 2}px`
            };
        }
    }
}
</script>

<style lang="scss">
.pt-row {
    position: relative;
    box-sizing: border-box;
    &::before, &::after {
        content: " ";
        display: table;
        clear: both
    }
}
</style>