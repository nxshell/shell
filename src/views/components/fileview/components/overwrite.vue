<template>
	<pt-dialog :title="askDialog.title" :show.sync="askDialog.show">
		<!-- 合并目录 -->
		<div v-if="askDialog.questionType === 'merge'" class="ask-dialog">
			<p class="message">{{ T('home.fileview.ask-dialogs.merge.message', askDialog.args.name) }}</p>
			<div v-if="askDialog.questionType === 'merge'" class="file-summary">
				<pt-row :gutter="20">
					<pt-col :span="12">
						<pt-row :gutter="10">
							<pt-col :span="8">
								<pt-icon size="large" type="img" :iconName="askDialog.icon"></pt-icon>
							</pt-col>
							<pt-col :span="16">
								<p>{{ T('home.fileview.ask-dialogs.merge.dir-info-name', askDialog.args.name) }}</p>
								<p>
									{{
										T(
											'home.fileview.ask-dialogs.merge.dir-info-lastmodify',
											askDialog.args.src.lastModify
										)
									}}
								</p>
							</pt-col>
						</pt-row>
					</pt-col>
					<pt-col :span="12">
						<pt-row :gutter="10">
							<pt-col :span="8">
								<pt-icon size="large" type="img" :iconName="askDialog.icon"></pt-icon>
							</pt-col>
							<pt-col :span="16">
								<p>{{ T('home.fileview.ask-dialogs.merge.dir-info-name', askDialog.args.name) }}</p>
								<p>
									{{
										T(
											'home.fileview.ask-dialogs.merge.dir-info-lastmodify',
											askDialog.args.dest.lastModify
										)
									}}
								</p>
							</pt-col>
						</pt-row>
					</pt-col>
				</pt-row>
			</div>
			<span>
				<input type="checkbox" v-model="askDialog.keep" />
				<span>
					{{ T('home.fileview.ask-dialogs.merge.keep') }}
				</span>
			</span>
		</div>
		<!-- 覆盖文件 -->
		<div v-if="askDialog.questionType === 'overwrite'" class="ask-dialog">
			<p class="message">{{ T('home.fileview.ask-dialogs.overwrite.message', askDialog.args.name) }}</p>
			<div class="file-summary">
				<pt-row :gutter="20">
					<pt-col :span="12">
						<pt-row :gutter="10">
							<pt-col :span="8">
								<pt-icon size="large" type="img" :iconName="askDialog.icon"></pt-icon>
							</pt-col>
							<pt-col :span="16">
								<p>
									{{ T('home.fileview.ask-dialogs.overwrite.file-info-name', askDialog.args.name) }}
								</p>
								<p>
									{{
										T('home.fileview.ask-dialogs.overwrite.file-info-size', askDialog.args.src.size)
									}}
								</p>
								<p>
									{{
										T(
											'home.fileview.ask-dialogs.overwrite.file-info-lastmodify',
											askDialog.args.src.lastModify
										)
									}}
								</p>
							</pt-col>
						</pt-row>
					</pt-col>
					<pt-col :span="12">
						<pt-row :gutter="10">
							<pt-col :span="8">
								<pt-icon size="large" type="img" :iconName="askDialog.icon"></pt-icon>
							</pt-col>
							<pt-col :span="16">
								<p>
									{{ T('home.fileview.ask-dialogs.overwrite.file-info-name', askDialog.args.name) }}
								</p>
								<p>
									{{
										T(
											'home.fileview.ask-dialogs.overwrite.file-info-size',
											askDialog.args.dest.size
										)
									}}
								</p>
								<p>
									{{
										T(
											'home.fileview.ask-dialogs.overwrite.file-info-lastmodify',
											askDialog.args.dest.lastModify
										)
									}}
								</p>
							</pt-col>
						</pt-row>
					</pt-col>
				</pt-row>
			</div>
			<span>
				<input type="checkbox" v-model="askDialog.keep" />
				<span>{{ T('home.fileview.ask-dialogs.overwrite.keep') }}</span>
			</span>
		</div>
		<el-button
			v-if="askDialog.questionType === 'merge'"
			slot="footer"
			type="danger"
			size="small"
			@click="handleMergeFolder"
			focus
			>{{ T('home.fileview.ask-dialogs.common-buttons.btn-merge') }}
		</el-button>
		<el-button
			v-if="askDialog.questionType === 'overwrite'"
			slot="footer"
			type="danger"
			size="small"
			@click="handleOverwrite"
			focus
			>{{ T('home.fileview.ask-dialogs.common-buttons.btn-overwrite') }}
		</el-button>
		<el-button slot="footer" type="info" size="small" @click="handleSkip" focus>
			{{ T('home.fileview.ask-dialogs.common-buttons.btn-skip') }}
		</el-button>
		<el-button slot="footer" size="small" @click="handleTransCancel">
			{{ T('home.fileview.ask-dialogs.common-buttons.btn-cancel') }}
		</el-button>
	</pt-dialog>
</template>

<script>
export default {
	name: 'OverwriteDialog',
	data() {
		return {}
	}
}
</script>
