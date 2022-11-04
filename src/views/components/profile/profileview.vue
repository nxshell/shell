<template>
	<el-scrollbar style="height: calc(100% - 400px);">
		<div class="pt-profile-view">
			<h1 :ref="settingConfig.name">{{ settingConfig.title }}</h1>
			<pt-profile-item v-for="(item,itemIdx) in settingConfig" :key="itemIdx"
			                 v-model="profileValues[item.name]"
			                 :title="item.title"
			                 :description="item.description"
			                 :defaultValue="item.defaultValue"
			                 :type="item.type"
			                 :options="item.options"
			                 :show="execExpr(item.show)"
			                 :simple="simple"
			                 :component="item.component"
			                 :context="profileValues"
			/>
		</div>
	</el-scrollbar>
</template>

<script>
import PtProfileItem from "./profileitem";

export default {
	name: "PtProfileView",
	components: {
		PtProfileItem
	},
	props: {
		value: Object,
		settingConfig: {
			type: Object,
			default: () => {
			}
		},
		simple: {
			type: Boolean,
			default: false
		},
		curSection: String
	},
	data() {
		return {
			profileValues: null,

			position: {},
			scrollHandler: null
		}
	},

	watch: {
		profileValues: {
			handler(val, oldVal) {
				this.$emit("input", this.profileValues);
			},
			deep: true
		},
		curSection(newVal) {
			this.scrollToLabel(newVal);
		}
	},

	computed: {
		execExpr() {
			return (expr) => {
				if (typeof expr === "undefined" || expr === '') {
					return true;
				}

				let func = new Function(['ctx', 'expr'], `
                    let ret;
                    with (ctx) {
                        try {
                            ret = eval(expr);
                        } catch (e) {
                            ret = true;
                        }
                    }
                    return ret;
                `);
				return func(this.profileValues, expr)
			};
		},

		showSections() {
			const expr = this.execExpr;
			return this.sections.map((item) => {
				if (expr(item.show)) {
					return item;
				}
			}).filter(item => item);
		}
	},

	created() {
		debugger
		this.profileValues = this.value;
	},

	mounted() {
		this.$nextTick(() => {

		});
	},

	methods: {
		setPositionLabel(label, el) {
			this.$set(this.position, label, el);
		},
		scrollToLabel(label) {
			let el = this.$refs[label][0];
			// found display != none label element
			for (let _el of this.$refs[label]) {
				if (_el.offsetParent !== null) {
					el = _el;
					break;
				}
			}
			el.scrollIntoView()
		}
	},

	beforeDestroy() {
	}
}
</script>

<style lang="scss">
.pt-profile-view {
	position: relative;
	width: 100%;
	height: 100%;

	h1 {
		padding-left: 10px;
		font-size: 20px;
		height: 30px;
		line-height: 30px;
		margin-bottom: 10px;

		color: var(--n-text-color-base);

		&:hover {
			background-color: var(--lightBackgroundColor);
		}
	}
}
</style>