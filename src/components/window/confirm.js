import Vue from "vue";
import ConfirmComponent from "./confirm.vue";

const Confirm = Vue.extend(ConfirmComponent);

function $confirm({title = "", message = "", type=""}) {
    return new Promise((resolve, reject) => {
        let confirm = new Confirm({
            data: {
                title,
                message,
                type,
                onOk: () => {
                    confirm.$destroy();
                    resolve();
                },
                onCancel: () => {
                    confirm.$destroy();
                    reject();
                }
            }
        });
        let mountPoint = document.createElement("div");
        document.body.appendChild(mountPoint);
        confirm.$mount(mountPoint);
    });
    
}

export default {
    install(Vue) {
        Object.defineProperty(Vue.prototype, "$confirm", {
            get() {
                return $confirm;
            }
        })
    }
}
