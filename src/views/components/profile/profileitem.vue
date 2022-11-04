<template>
	<div class="pt-profile-item" v-if="show" :class="{simple: simple}">
		<template v-if="!simple">
			<h2>{{ title }}</h2>
			<p>{{ description }}</p>
			<pt-row>
				<pt-col :span="8">
					<el-input v-model="editValue" v-if="type === 'text'" type="text" />
					<el-input v-model="editValue" v-if="type === 'number'" type="text" />
					<el-input v-model="editValue" v-if="type === 'password'" type="password" />
					<pt-file v-model="editValue" type="text" v-if="type === 'file'" />
					<pt-folder v-model="editValue" type="text" v-if="type === 'folder'" />
					<el-select v-model="editValue" v-if="type === 'select'" style="width: 100%;">
						<el-option v-for="(opt, idx) in options" :key="idx"
						           :label="opt.label"
						           :value="opt.value" />
					</el-select>
					<component v-if="component" :is="component" v-bind:context="context"></component>
				</pt-col>
			</pt-row>
		</template>
		<template v-else>
			<pt-row :title="T(description)">
				<pt-col :span="8">
					<label>{{ T(title) }}</label>
				</pt-col>
				<pt-col :span="8">
					<el-input v-model="editValue" v-if="type === 'text'" />
					<el-input v-model="editValue" v-if="type === 'number'" />
					<el-input v-model="editValue" v-if="type === 'password'" type="password" />
					<pt-file v-model="editValue" type="text" v-if="type === 'file'" />
					<pt-folder v-model="editValue" type="text" v-if="type === 'folder'" />
					<el-select v-model="editValue" v-if="type === 'select'" style="width: 100%;">
						<el-option v-for="(opt, idx) in options" :key="idx"
						           :label="T(opt.label)"
						           :value="opt.value" />
					</el-select>
					<component v-if="component" :is="component" v-bind:context="context"></component>
				</pt-col>
			</pt-row>
		</template>
	</div>
</template>

<script>
export default {
	name: "PtProfileItem",
	props: {
		title: String,
		description: String,
		value: [String, Number, Array],
		defaultValue: [String, Number],
		type: String,
		options: Array,
		show: Boolean,
		simple: {
			type: Boolean,
			default: false
		},
		component: Object,
		context: Object
	},
	data() {
		return {
			editValue: undefined
		}
	},

	watch: {
		value(newVal) {
			if (this.editValue != newVal) {
				this.editValue = newVal;
			}
		},
		editValue(newVal) {
			this.$emit("input", newVal);
		}
	},

	created() {
		this.editValue = typeof this.value === "undefined" ? this.defaultValue : this.value;
	}
}
</script>

<style lang="scss">
.pt-profile-item {
	position: relative;
	margin-bottom: 15px;
	padding: 10px;

	&:hover {
		background-color: var(--n-bg-color-light);
	}

	&.simple {
		margin-bottom: 5px;
		padding: 5px 10px;
	}

	.pt-col {
		height: 30px;
		line-height: 30px;
	}

	h2 {
		margin-bottom: 10px;
		font-size: 14px;
		font-weight: 600;
		color: var(--n-text-color-base);
	}

	label {
		font-size: 11px;
		font-weight: 600;
		color: var(--n-text-color-base);
	}

	p {
		margin-bottom: 10px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--secondaryTextColor);
	}
}
</style>