import Vue from 'vue'
import CodeEditor from 'bin-code-editor';
import 'bin-code-editor/lib/styles/index.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from "./router";
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(CodeEditor);
Vue.use(ElementUI);
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
