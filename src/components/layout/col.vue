<template>
    <div class="pt-col" :class="'pt-col-' + span" :style="style">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "PtCol",
    props: {
        span: {
            type: Number,
            default: 24
        }
    },

    computed: {
        style() {
            // Col父元素为Row，所以对父元素是有依赖的
            return this.$parent.childStyle || {};
        }
    }
}
</script>

<style lang="scss">
@mixin pt-col($width) {
    width: $width;
}

.pt-col {
    float: left;
    box-sizing: border-box;
}

.pt-col-1 {
    @include pt-col(4.167%)
}

.pt-col-2 {
    @include pt-col(8.333%)
}

.pt-col-3 {
    @include pt-col(12.5%)
}

.pt-col-4 {
    @include pt-col(16.667%)
}

.pt-col-5 {
    @include pt-col(20.833%)
}

.pt-col-6 {
    @include pt-col(25%)
}

.pt-col-7 {
    @include pt-col(29.167%)
}

.pt-col-8 {
    @include pt-col(33.333%)
}

.pt-col-9 {
    @include pt-col(37.5%)
}

.pt-col-10 {
    @include pt-col(41.667%)
}

.pt-col-11 {
    @include pt-col(45.833%)
}

.pt-col-12 {
    @include pt-col(50%)
}

.pt-col-13 {
    @include pt-col(54.167%)
}

.pt-col-14 {
    @include pt-col(58.333%)
}

.pt-col-15 {
    @include pt-col(62.5%)
}

.pt-col-16 {
    @include pt-col(66.667%)
}

.pt-col-17 {
    @include pt-col(70.833%)
}

.pt-col-18 {
    @include pt-col(75%)
}

.pt-col-19 {
    @include pt-col(79.167%)
}

.pt-col-20 {
    @include pt-col(83.333%)
}

.pt-col-21 {
    @include pt-col(87.5%)
}

.pt-col-22 {
    @include pt-col(91.667%)
}

.pt-col-23 {
    @include pt-col(95.833%)
}

.pt-col-24 {
    @include pt-col(100%)
}
</style>
