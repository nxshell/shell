<template>
    <div class="pt-status-bar">
        <slot />
    </div>
</template>

<script>
export default {
    name: "PtStatusBar"
}
</script>

<style lang="scss">
.pt-status-bar {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 24px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: {
        left: 5px;
        right: 5px;
    }
    color: var(--primaryTextColor);
    box-sizing: content-box;
    border-top: 1px solid var(--borderColor);

    background-color: var(--backgroundColor);
}
</style>