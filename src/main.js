import Vue from 'vue';
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import iView from 'iview';
import 'babel-polyfill';
import 'classlist-polyfill';
import 'ie9-oninput-polyfill';
import raf from 'raf';
import { SCHEDULE_TOKEN_REFRESH } from '@/store/auth.module';
import '@/styles/iview/iview.css';
import App from '@/App.vue';
import router from '@/routes/router';
import store from '@/store/store';
import ConfirmModal from '@/components/ConfirmModal';

raf.polyfill();

Vue.use(iView);
Vue.use(ConfirmModal);
Vue.use(Element);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

store.dispatch(SCHEDULE_TOKEN_REFRESH);
