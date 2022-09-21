<template>
    <select class="pt-select" v-model="nativeValue">
        <slot></slot>
    </select>
</template>

<script>
export default {
    name: "PtSelect",
    props: {
        value: {
            type: String | Number,
            default: ""
        }
    },

    data () {
        return {
            nativeValue: ""
        }
    },

    watch: {
        value(newVal) {
            if (newVal !== this.nativeValue) {
                this.nativeValue = newVal;
            }
        },
        nativeValue(newVal) {
            this.handleChange(newVal);
        }
    },

    created() {
        this.nativeValue = this.value;
    },

    methods: {
        handleChange(newValue) {
            this.$emit("input", newValue);
        }
    }
}
</script>

<style lang="scss">
@import "../../assets/scss/_const.scss";
.pt-select {
    position: relative;
    box-sizing: border-box;
    border-radius: 2px;
    outline: none;

    height: $selectHeight;

    border: solid 1px var(--borderColor);
    background-color: var(--backgroundColor);
    color: var(--primaryTextColor);
}
</style>