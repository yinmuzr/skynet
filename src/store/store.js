import Vue from 'vue';
import Vuex from 'vuex';
import menus from './menus.module';
import auth from './auth.module';
import hierarchy from './hierarchy.module';
import roles from './roles.module';
import organizations from './organization.module';
import users from './users.module';
import report from './report.module';
import reportDetails from './report-details.module';
import riskWarning from './risk-warning-report.module';
import riskDetails from './risk-details.module';


Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    menus,
    auth,
    hierarchy,
    roles,
    organizations,
    users,
    report,
    reportDetails,
    riskWarning,
    riskDetails,
  },
});
