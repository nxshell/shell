<template>
    <div class="pt-form-item">
        <span class="label">{{ label }}</span>
        <slot/>
    </div>
</template>

<script>
export default {
    name: "PtFormItem",
    props: {
        label: String
    },

    created() {
        // console.log(this.$parent);
    }
}
</script>

<style lang="scss">

@import "@/assets/scss/_const.scss";

.pt-form-item {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;

    padding: {
        top: 5px;
        bottom: 5px;
    }
    min-height: $listItemHeight;

    .label {
        min-width: 80px;
        margin-right: 5px;
        font-weight: bold;
    }
}
</style>