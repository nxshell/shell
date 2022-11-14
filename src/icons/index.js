import Vue from 'vue'
import NIcon from '@/components/svgicon/index.vue' // svg component

Vue.component(NIcon.name, NIcon);
const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)