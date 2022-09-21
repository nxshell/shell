<template>
    <button class="pt-flat-button pt-button">
        <pt-icon v-if="icon" :iconName="icon" />
        <slot />
    </button>
</template>

<script>
import PtRipple from "../base/ripple";

export default {
    name: "PtFlatButton",
    components: {
        PtRipple
    }
}
</script>

<style lang="scss">
.pt-flat-button {
    position: relative;
    overflow: hidden;
}
</style>
