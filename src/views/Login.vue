<template>
	<div class="pt-login" :class="{'login-success': userInfo != null}">
		<template v-if="userInfo == null">
			<div class="header">
				<n-icon name="logo" size="50"/>
				<div class="title">
					<div class="welcome">{{ $t("home.user-center.login") }}</div>
					<div class="product-name">NxShell</div>
				</div>
			</div>
			<div class="auth-notice">
				<div class="sepline"></div>
				<div class="text">{{ $t("home.user-center.auth-type") }}</div>
				<div class="sepline"></div>
			</div>
			<div class="third-auths">
				<div class="auth-provider" @click="gotoAuth('Gitee')">
					<img class="logo" src="@/assets/images/Gitee.png">
					<div class="name">Gitee</div>
				</div>
				<div class="auth-provider" @click="gotoAuth('GitHub')">
					<img class="logo" src="@/assets/images/GitHub.png">
					<div class="name">Github</div>
				</div>
			</div>
		</template>
		<template v-else>
			<div class="user-info">
				<el-avatar :avatarUrl="avatarUrl" :avatarName="avatarName" className="avatar" />
				<div class="user-name">
					{{ userInfo.user_name }}
				</div>
				<a class="logout" href="javascript:;" @click="logout">{{ $t("home.user-center.logout") }}</a>
			</div>
			<div class="user-contents">
				<div class="user-contents-nav">
					<pt-list :listData="navItems" dataKey="title">
						<template v-slot="scope">
							<span>{{ $t(scope.item.data.title) }}</span>
						</template>
					</pt-list>
				</div>
				<div class="user-contents-body">
					<p>{{ $t("home.user-center.thanks") }}</p>
					<p>{{ $t("home.user-center.look-forward-to-feedback") }}</p>
					<a href="javascript:;" @click="gotoFeedback">{{
							$t("home.user-center.goto-feedback-github")
						}}</a><span
					class="email">&nbsp;{{
						$t("home.user-center.goto-feedback-or")
					}}&nbsp;<span>{{ $t("home.user-center.goto-feedback-email") }}</span></span>
					<div v-if="0" class="thanks-given">
						<i>为了感谢您的反馈，一旦您的建议和意见被我们采用，我们将把您的名字记录到我们的贡献列表中，让更多人了解您为大家做的贡献！</i>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
	name: "Login",
	data() {
		return {
			OAUTH: {
				Gitee: 'https://gitee.com/oauth/authorize?client_id=64109d78613c770821b77221e55e44dba3eaa3e6f5ebb097c7ccf1a3888eae81&redirect_uri=http%3A%2F%2F106.15.238.81%3A56789%2Foauth%2Foauth%2Fgitee&response_type=code',
				GitHub: 'https://github.com/login/oauth/authorize?client_id=cccfa01fac33cfbe81ae&scope=user'
			},
			cbFunc: () => {
			},

			navItems: [
				{
					title: "home.user-center.feedback"
				}
			]
		}
	},

	computed: {
		...mapGetters(['userInfo']),
		avatarUrl() {
			return this.userInfo ? this.userInfo.user_avatar : "";
		},
		avatarName() {
			return this.userInfo ? this.userInfo.user_name : "";
		}
	},

	created() {
		this.cbFunc = (evt) => {
			if (typeof evt.data != "object" || !("user_name" in evt.data)) {
				return;
			}
			this.setUserInfo(evt.data);
		};

		window.addEventListener("message", this.cbFunc);
	},

	methods: {
		...mapMutations(['setUserInfo']),
		gotoAuth(type) {
			const oAuthUrl = this.OAUTH[type];
			powertools.openDialog(oAuthUrl, { width: 1100, height: 725 });
		},

		gotoFeedback() {
			const feedbackUrl = "https://github.com/nxshell/nxshell/issues";
			powertools.openExterUrl(feedbackUrl);
		},

		logout() {
			this.setUserInfo(null);
		}
	},

	beforeDestroy() {
		window.removeEventListener("message", this.cbFunc);
	}
}
</script>

<style lang="scss">

.pt-login {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	height: 100%;
	background-color: var(--n-bg-color-base);

	&.login-success {
		display: block;
		padding: 20px 60px;
	}

	.header {
		display: flex;
		justify-content: center;

		margin-bottom: 120px;

		img {
			width: 68px;
			height: 68px;
			margin-right: 20px;
		}

		.title {
			.welcome {
				margin-bottom: 18px;
				font-size: 16px;
				color: var(--secondaryTextColor);
			}

			.product-name {
				font-size: 32px;
				font-weight: 600;
				color: var(--n-text-color-base);
			}
		}
	}

	.auth-notice {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 260px;
		margin-bottom: 40px;

		.sepline {
			height: 1px;
			flex-grow: 1;
			background-color: var(--n-bg-color-base);
		}

		.text {
			margin: {
				left: 10px;
				right: 10px;
			};
			font-size: 14px;
			color: var(--secondaryTextColor);
		}

	}

	.third-auths {
		display: flex;
		justify-content: center;

		.auth-provider {
			margin-right: 40px;

			cursor: pointer;

			&:last-child {
				margin-right: 0;
			}

			.logo {
				width: 48px;
				height: 48px;
				margin-bottom: 10px;
			}

			.name {
				text-align: center;
				font-size: 16px;
				color: var(--secondaryTextColor);
			}
		}
	}

	.user-info {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		height: 60px;
		padding: 20px;
		border-radius: 10px;
		border: 1px solid var(--n-bg-color-base);

		background-color: var(--n-bg-color-light);

		.pt-avatar {
			margin-right: 20px;
		}

		.user-name {
			flex-grow: 1;
			font-size: 20px;
			font-weight: 600;
			color: var(--n-text-color-base);
		}

		.logout {
			font-size: 16px;
			text-decoration: none;
			color: var(--secondaryTextColor);

			&:hover {
				color: var(--primaryColor);
			}
		}
	}

	.user-contents {
		display: flex;
		justify-content: flex-start;
		margin-top: 16px;

		.user-contents-nav {
			width: 200px;
			border-right: 1px solid var(--n-bg-color-base);

			.pt-list {
				overflow: hidden;

				ul {
					border: none;
				}

				.pt-list-item {
					height: 48px;
					line-height: 48px;
					font-size: 16px;
					color: var(--primaryColor);

					&:hover {
						background-color: white;
						color: var(--primaryColor);
						font-weight: 600;
					}

					&.selected {
						background-color: white;
						color: var(--primaryColor);
						font-weight: 600;
					}
				}
			}
		}

		.user-contents-body {
			flex-grow: 1;
			padding: 20px;

			p {
				font-size: 14px;
				line-height: 1.5;
				color: var(--n-text-color-base);
				margin-bottom: 10px;
			}

			a {
				color: var(--primaryColor);
				font-size: 16px;
			}

			.email {
				font-size: 16px;
			}

			.thanks-given {
				margin-top: 5px;
				color: var(--secondaryTextColor);
				font-size: 12px;
			}
		}
	}
}
</style>