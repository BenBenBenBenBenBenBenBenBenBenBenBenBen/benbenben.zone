import Vue from 'vue'
import { Closable } from './directives/closable'
import Vue2TouchEvents from 'vue2-touch-events'
import VueLazyload from 'vue-lazyload'
import App from './App.vue'

Vue.config.productionTip = false
Vue.directive('closable', Closable)
Vue.use(Vue2TouchEvents)
Vue.use(VueLazyload)

new Vue({
  render: h => h(App)
}).$mount('#app')
