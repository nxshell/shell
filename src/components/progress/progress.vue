<template>
    <div class="pt-progress-root">
<!--        <div class="pt-progress" :style="{ height: height + 'px', width: width + 'px'}">-->
<!--            <div class="progress" :style="{ height: height + 'px', width: progress + '%'}"></div>-->
<!--        </div>-->
	    <el-progress :text-inside="true" :stroke-width="26" :percentage="100"></el-progress>
        <div class="left-padding"> {{ progress }}% </div>
        <div class="left-padding"> {{ speed }} </div>
    </div>
</template>

<script>
export default {
    name: "PtProgress",
    props: {
        progress: {
            type: Number,
            default: 0
        },

        speed: {
            type: String,
            default: ''
        },

        width: {
            type: Number,
            default: 200
        },

        height: {
            type: Number,
            default: 20
        }
    }
}
</script>

<style lang="scss">
.pt-progress-root {
    display: flex;
    //flex-direction: row;
    align-items: center;
	justify-content: flex-start;
}
.left-padding {
    padding-left: 5px;
}
//.pt-progress {
//    position: relative;
//    border: 1px solid var(--borderColor);
//    .progress {
//        position: relative;
//        height: 100%;
//        overflow: hidden;
//        background-color: var(--processBarColor);
//    }
//}
</style>