<template>
	<div class='n-home-empty'>
		<div class='n-home-content'>
			<span class='n-logo'>
				<n-icon name='logo' size='70' />
			</span>
			<p class='n-logo-text'>NxShell</p>
		</div>
		<h1>{{ t('app.welcome') }}</h1>
		<div class='n-home-footer'>
			<div class='n-home-footer__feedback'>
				<nx-button icon='official-website' label='app.website' label-align='flex-end' @click='toWebsite' />
				<nx-button icon='github' label='Github' label-align='flex-end' @click='toStar' />
				<nx-button icon='bug' label='home.welcome.reportProblem' label-align='flex-end' @click='toIssues' />
			</div>
			<div class='n-home-footer__version'>{{ t('home.welcome.software-version') }} {{ version }}</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n-bridge'
import NxButton from '@/components/nxButton/index.vue'

const { t } = useI18n()
const version = computed(() => `V${window.powertools.getVersion()}`)

const toWebsite = () => {
	window.powertools.openExterUrl('https://nxshell.github.io/')
}
const toStar = () => {
	const github = 'https://github.com/nxshell/nxshell'
	window.powertools.openExterUrl(github)
}
const toIssues = () => {
	const issues = 'https://github.com/nxshell/nxshell/issues'
	window.powertools.openExterUrl(issues)
}
</script>

<style lang='scss' scoped>
.n-home-empty {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
  // background-color: var(--n-bg-color-base);
  h1 {
    color: var(--n-text-color-base);
  }

  .n-home-content {
    flex: 1 0 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .n-logo {
      display: inline-block;
      width: 80px;
      height: 80px;
      box-sizing: border-box;
      z-index: 0;

      &::before {
        position: absolute;
        content: '';
        width: 65px;
        height: 60px;
        background: #000;
        transform: translate(-35px, 25px) scaleY(0.5) skew(50deg);
        z-index: -1;
        filter: blur(5px);
        -webkit-mask-image: -webkit-gradient(linear, left top, left bottom, from(transparent), to(#000));
        mask-image: linear-gradient(to bottom, transparent, #000);
      }
    }

    .n-logo-text {
      margin-left: 60px;
      font-size: 80px;
      font-weight: 700;
      color: #132847;
      z-index: 0;

      &::before {
        position: absolute;
        content: 'NxShell';
        color: #000;
        transform: translate(-35px, 15px) scaleY(0.5) skew(50deg);
        z-index: -1;
        filter: blur(3px);
        -webkit-mask-image: -webkit-gradient(linear, left top, left bottom, from(transparent), to(#000));
        mask-image: linear-gradient(to bottom, transparent, #000);
      }
    }
  }

  .n-home-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 40px;
    padding: 5px 15px;
    box-sizing: border-box;
    background-color: var(--n-bg-color-base);
    color: var(--n-text-color-base);

    &__feedback {
      display: flex;
      align-items: center;
      column-gap: 20px;

      .n-icon-button {
        font-size: 13px;
      }
    }
  }
}
</style>
