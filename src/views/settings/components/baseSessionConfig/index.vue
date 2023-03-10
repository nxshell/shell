<template>
	<div class="n-session-config">
		<el-form :form="sessionForm">
			<el-form-item :label="$t('home.profile.base.host-name.title')">
				<el-input v-model="sessionForm.hostName" />
			</el-form-item>
			<!-- 操作系统 -->
			<el-form-item :label="$t(OsType.title)">
				<el-select v-model="sessionForm[OsType.name]">
					<el-option v-for="(o,i) in OsType.options" :label="$t(o.label)" :value="o.value" :key="i" />
				</el-select>
			</el-form-item>
			<!-- 协议 -->
			<el-form-item :label="$t(Protocol.title)">
				<el-select v-model="sessionForm[Protocol.name]" @change="protocolChange">
					<el-option v-for="(o,i) in Protocol.options" :label="$t(o.label)" :value="o.value" :key="i" />
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>
<script>
import OsType from '../../constants/osType'
import Protocol from '../../constants/protocol'

export default {
	name: 'NxSessionBaseConfig',
	data() {
		return {
			OsType,
			Protocol,
			sessionForm: {}
		}
	},
	methods: {
		protocolChange() {
			console.log('协议切换')
		}
	}

}
</script>