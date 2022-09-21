<template>
    <div class="pt-ripple"></div>
</template>

<script>
export default {
    name: "PtRipple",
    props: {
        x: Number,
        y: Number
    }
}
</script>

<style lang="scss">
.pt-ripple {
    position: absolute;
}
</style>
