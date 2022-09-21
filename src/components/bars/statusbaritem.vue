<template>
    <div class="pt-status-bar-item"
        :style="{
            grow: grow ? 1 : 0,
            shrink: shrink ? 1 : 0,
            justifyContent: justifyContent
        }"
    >
        <slot />
    </div>
</template>

<script>
export default {
    name: "PtStatusBarItem",
    props: {
        grow: Boolean,
        shrink: Boolean,
        padding: {
            type: Number,
            default: 0
        },
        align: {
            type: String,
            default: "left"
        }
    },
    computed: {
        justifyContent() {
            return {
                left: "flex-start",
                center: "center",
                right: "flex-end"
            }[this.align];
        }
    }
}
</script>

<style lang="scss">
.pt-status-bar-item {
    display: flex;
}
</style>