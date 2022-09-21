<template>
    <form class="pt-form" 
        autocomplete="false"
        @submit.prevent
        @reset.prevent>
        <slot></slot>
    </form>
</template>

<script>
export default {
    name: "PtForm"
}
</script>

<style lang="scss">
.pt-form {
    padding: 10px;
}
</style>