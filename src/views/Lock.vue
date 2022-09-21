<template>
    <div class="lock-page">
        <div class="center" v-if="lock">
            <div class="lock-desc">{{  T("lock.lock_desc") }}</div>
            <div class="item">
                <label class="password-note">{{ T("lock.password_desc") }}</label>
                <pt-inputbox type="password"
                    v-model="password"
                    className="password-input"
                    slot="center"
                />
            </div>
            <div class="item">
                <label class="password-note">{{ T("lock.password_verify") }}</label>
                <pt-inputbox type="password"
                    v-model="password_verify"
                    className="password-input"
                    slot="center"
                />
            </div>
            <div class="item">
                <pt-button class="btn" type="primary" size="small" @click="handleOk" >{{ T("components.OK") }}</pt-button>
                <pt-button class="btn" type="primary" size="small" @click="back" >{{ T("components.Cancel") }}</pt-button>
            </div>
        </div>
        <div class="center" v-else>
            <div class="lock-desc">{{ T("lock.unlock_desc") }}</div>
            <div class="item">
                <label class="password-note">{{ T("lock.unlock_password_desc") }}</label>
                <pt-inputbox type="password"
                    v-model="password_input"
                    className="password-input"
                    slot="center"
                />
            </div>
            <div class="item">
                <pt-button class="btn" type="primary" size="small" @click="handleUnLock" >{{ T("components.OK") }}</pt-button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
    data() {
        return {
            lock: true,
            password: "",
            password_verify: "",
            password_input: ""
        }
    },
    computed: {
        ...mapState(["userLock"]),
    },
    methods: {
        ...mapMutations(['setUserLock']),
        back() {
            this.$router.back();
        },

        handleOk() {
            if (this.password == this.password_verify) {
                this.lock = false;
                this.setUserLock(false);
            }
        },

        handleUnLock() {
            if (this.password_input == this.password) {
                this.lock = true;
                this.password_input = "";
                this.setUserLock(true);
                this.back();
            }
        },
    }
}
</script>

<style lang="scss">

.lock-page {
    background-color: var(--backgroundColor);
    width: 100%;
    height: 100%;
    font-size: 20px;

    color: var(--primaryTextColor);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    align-items: center;

    .lock-desc {
        font-size: 20px;
        color: var(--primaryTextColor);
        margin-bottom: 25px;
    }

    .item {
        margin-bottom: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;

        .btn {
            width: 20%;
            min-width: 40px;
        }
    }

    .password-note {
        margin-right: 10px;
        color: var(--primaryTextColor);
        font-size: 15px;
    }
}

</style>
