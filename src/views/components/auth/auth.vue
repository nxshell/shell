<template>
    <pt-dialog
        :title="T('components.auth.title')"
        :show.sync="showDialog"
        @ok="handleOk"
        @cancel="handleCancel"
    >
        <div v-if="type === 'auth'">
            <pt-form-item :label="T('components.auth.authType.title')">
                <select v-model="authType" class="pt-select">
                    <option v-for="(opt, idx) in options" :key="idx"
                        :value="opt.value"
                    > {{ T(opt.label) }} </option>
                </select>
            </pt-form-item>
            <pt-form-item :label="T('components.auth.username.title')" v-if="authType === 'password' || authType === 'publickey' || authType === 'keyboard-interactive'">
                <pt-inputbox type="text" :placeholder="authUserName" disabled />
            </pt-form-item>
            <pt-form-item :label="T('components.auth.password.title')" v-if="authType === 'password'">
                <pt-inputbox type="password" v-model="authPassword" @keydown.enter.native="doOK" ref="inputpassword"/>
            </pt-form-item>
            <pt-form-item :label="T('components.auth.publickey.title')" v-if="authType === 'publickey'">
                <pt-file v-model="authPublicKey" type="text" />
            </pt-form-item>
            <pt-form-item :label="T('components.auth.passphrase.title')" v-if="authType === 'publickey'">
                <pt-inputbox v-model="authPassphrase" type="password" @keydown.enter.native="doOK"/>
            </pt-form-item>
        </div>
        <pt-form-item :label="T('components.auth.username.title')" v-else-if="type === 'username'">
            <pt-inputbox type="text" v-model="authUserName" @keydown.enter.native="doOK" ref="inputusername"/>
        </pt-form-item>
        <div class="prompt" v-else>
            <div>{{ promptName }}</div>
            <pt-inputbox type="text" v-model="promptValue" ref="inputprompt"/>
        </div>
    </pt-dialog>
</template>

<script>

export default {
    name: "PtAuthDialog",
    components: {
    },
    props: {
    },
    data() {
        return {
            showDialog: false,
            authType: "",
            type: "auth",
            data: [],
            options: [],
            authUserName: "",
            authPassword: "",
            authPublicKey: "",
            authPassphrase: "",
            promptValue: "",
        };
    },

    computed: {
        promptName() {
            const prompt = this.data[0];
            if(prompt) {
                return prompt.prompt;
            } else {
                return "";
            }
        }
    },

    created() {
    },

    mounted() {
    },
    
    methods: {
        show(data) {
            let dofocus = () => {

            };
            if(data.type === "authDialog") {
                this.data = data.data;
                this.type = "auth";
                this.authUserName = data.username;
                this.authOptions();
                dofocus = ()=> {
                    setTimeout(() => {
                        this.$refs.inputpassword.dofocus();
                    });
                };
            } else if(data.type === "authPrompt") {
                this.data = data.data;
                this.type = "prompt";
                dofocus = ()=> {
                    setTimeout(() => {
                        this.$refs.inputprompt.dofocus();
                    });
                };
            } else if(data.type === "username") {
                this.type = "username";
                dofocus = ()=> {
                    setTimeout(() => {
                        this.$refs.inputusername.dofocus();
                    });
                };
            }
            this.showDialog = true;
            dofocus();
        },

        authOptions() {
            const methods = this.data;
            let options = [];
            if(methods.indexOf('password') >= 0) {
                options.push({
                    label: 'password',
                    value: 'password',
                });
            }
            if(methods.indexOf('publickey') >= 0) {
                options.push({
                    label: 'publickey',
                    value: 'publickey',
                });
            }
            if(methods.indexOf('keyboard-interactive') >= 0) {
                options.push({
                    label: 'keyboard-interactive',
                    value: 'keyboard-interactive',
                });
            }
            this.options = options;
            
            if(options.length) {
                this.authType = options[0].value;
            }
        },

        handleInput(v) {
            console.log('handleInput', v)
        },

        handleOk() {
            if(this.type == "auth") {
                if(this.authType === 'password') {
                    this.$emit('authOk', {type: "password", username: this.authUserName, password: this.authPassword})
                } else if(this.authType === 'publickey') {
                    this.$emit('authOk', {type: "publickey", username: this.authUserName, passphrase: this.authPassphrase, publickey: this.authPublicKey?this.authPublicKey[0].data:""})
                } else if(this.authType === 'keyboard-interactive') {
                    this.$emit('authOk', {type: "keyboard-interactive", username: this.authUserName})
                }
            } else if(this.type === "username") {
                this.$emit('authOk', {type: 'username', username: this.authUserName});
            } else {
                this.$emit('authOk', {type: 'prompt', data: [this.promptValue]});
            }
        },

        doOK() {
            this.showDialog = false;
            this.handleOk()
        },

        handleCancel() {
            this.$emit('authOk', {type: 'cannel'});
        }
    }
}
</script>

<style lang="scss">
@import "../../../assets/scss/_const.scss";

.pt-select {
    position: relative;
    box-sizing: border-box;
    border-radius: 2px;
    outline: none;

    height: $selectHeight;

    border: solid 1px var(--borderColor);
}

</style>