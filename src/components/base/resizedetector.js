import Vue from "vue";
import ElementResizeDetectorMaker from "element-resize-detector";

export default {
    install() {
        Vue.prototype.$ptElementResizeDetector = ElementResizeDetectorMaker({
            strategy: "scroll" //<- For ultra performance.
        });
    }
};
