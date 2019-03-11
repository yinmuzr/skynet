import Vue from 'vue';
import Router from 'vue-router';
import { isEmpty, isArray, isUndefined, reduce } from 'lodash';
import { getToken, redirectToSSOLogin, SYS_AUTHORITIES, storeBase } from '@/utils/auth';
import SkynetHome from '@/views/Home.vue';
import SkynetRiskEntrance from '@/views/risk/RiskEntrance.vue';
import RiskEarlyWarningTable from '@/views/risk/RiskEarlyWarningTable.vue';
import SkynetRiskOffline from '@/views/risk/RiskOffline.vue';
import SkynetRiskDetails from '@/views/risk/RiskDetail';
import SkynetDataEntrance from '@/views/data-monitor/DataEntrance.vue';
import SkynetDataOffline from '@/views/data-monitor/DataOffline.vue';
import SkynetDataInspection from '@/views/data-monitor/DataInspection.vue';
import SkynetInspectionDetail from '@/views/data-monitor/InspectionDetail.vue';
import SkynetUpload from '@/views/data-monitor/Upload.vue';
import SkynetLogin from '@/views/auth/Login.vue';
import SkynetContentContainer from '@/views/ContentContainer.vue';
import SkynetNotFoundPage from '@/views/NotFoundPage.vue';
import SkynetForbiddenPage from '@/views/ForbiddenPage.vue';
import SkynetHierarchyAndRole from '@/views/auth/HierarchyAndRole.vue';
import SkynetOrganizationAndPeople from '@/views/auth/OrganizationAndPeople.vue';
import SkynetInitializer from '@/views/Initializer.vue';
import SkynetEarlyWarningStrategy from '@/views/risk/EarlyWarningStrategy.vue';
import store from '@/store/store';
import { HIDE_SUMB_MENU } from '@/store/menus.module';
import { UPDATE_CURRENT_BASE } from '@/store/auth.module';
import { WARNING_DATE_OFFSET_MAP } from '@/utils/constant';

Vue.use(Router);

const isDevMode = window.DEV_MODE === 'true';

const buildRiskDetailProps = route => ({
  date: route.params.date,
  filterParams: {
    ...route.query,
    ...reduce(
      ['privilegedBaseCodes', 'unqualifiedTypes', 'unqualifiedReasonCodes', 'unqualifiedReasonNames'],
      (result, queryKey) => {
        const value = route.query[queryKey];
        return isUndefined(value) ? result : { ...result, [queryKey]: isArray(value) ? value : [value] };
      },
      {},
    ),
  },
  currentInspectionType: route.query.inspectionType,
});

const buildSkynetEarlyWarningStrategyProps = route => ({
  date: route.params.date,
});

const riskRoutes = [
  {
    path: '/risk',
    name: 'risk-home',
    component: SkynetContentContainer,
    props: true,
    children: [
      {
        path: 'entrance',
        name: 'risk-entrance-home-container',
        component: SkynetContentContainer,
        props: true,
        children: [
          {
            path: ':date',
            name: 'risk-entrance-container',
            component: SkynetContentContainer,
            props: true,
            children: [
              {
                path: '',
                name: 'risk-entrance',
                component: SkynetRiskEntrance,
                props: true,
                authority: SYS_AUTHORITIES.RISK_ENTRANCE_INSPECTION_VIEWABLE,
                children: [
                  {
                    path: '',
                    name: 'risk-early-warning',
                    component: RiskEarlyWarningTable,
                    props: true,
                    authority: SYS_AUTHORITIES.RISK_ENTRANCE_INSPECTION_VIEWABLE,
                    params: {
                      date: WARNING_DATE_OFFSET_MAP.TODAY.router.params.date,
                    },
                  },
                ],
              },
              {
                path: 'details',
                name: 'risk-entrance-details',
                component: SkynetRiskDetails,
                props: buildRiskDetailProps,
                authority: SYS_AUTHORITIES.RISK_ENTRANCE_INSPECTION_VIEWABLE,
                hideSubMenu: true,
              },
              {
                path: 'strategies',
                name: 'risk-entrance-strategies',
                component: SkynetEarlyWarningStrategy,
                props: buildSkynetEarlyWarningStrategyProps,
                authority: SYS_AUTHORITIES.RISK_ENTRANCE_INSPECTION_VIEWABLE,
                hideSubMenu: true,
              },
            ],
          },
        ],
      },
      {
        path: 'offline',
        name: 'risk-offline',
        component: SkynetRiskOffline,
        authority: 'RISK_OFF_LINE_VIEWABLE',
      },
    ],
  },
];

const dataRoutes = [
  {
    path: '/data',
    name: 'data-home',
    component: SkynetContentContainer,
    children: [
      {
        path: 'entrance',
        name: 'data-entrance',
        component: SkynetDataEntrance,
        children: [
          {
            path: 'sample-inspection',
            name: 'data-sample-inspection-container',
            component: SkynetContentContainer,
            children: [
              {
                path: '',
                name: 'data-sample-inspection',
                component: SkynetDataInspection,
                authority: SYS_AUTHORITIES.DATA_ENTRANCE_INSPECTION_VIEWABLE,
              },
              {
                path: 'details',
                name: 'data-sample-inspection-details',
                component: SkynetInspectionDetail,
                authority: SYS_AUTHORITIES.DATA_ENTRANCE_INSPECTION_VIEWABLE,
                hideSubMenu: true,
              },
            ],
          },
          {
            path: 'full-inspection',
            name: 'data-full-inspection-container',
            component: SkynetContentContainer,
            children: [
              {
                path: '',
                name: 'data-full-inspection',
                component: SkynetDataInspection,
                authority: SYS_AUTHORITIES.DATA_ENTRANCE_INSPECTION_VIEWABLE,
              },
              {
                path: 'details',
                name: 'data-full-inspection-details',
                component: SkynetInspectionDetail,
                authority: SYS_AUTHORITIES.DATA_ENTRANCE_INSPECTION_VIEWABLE,
                hideSubMenu: true,
              },
            ],
          },
        ],
      },
      {
        path: 'offline',
        name: 'data-offline',
        component: SkynetDataOffline,
        authority: SYS_AUTHORITIES.DATA_OFF_LINE_VIEWABLE,
      },
    ],
  },
];

const iamRoutes = [
  {
    path: '/iam',
    name: 'iam',
    component: SkynetContentContainer,
    children: [
      {
        path: 'role',
        name: 'iam-role-home',
        component: SkynetHierarchyAndRole,
        props: true,
        meta: { hideBaseMenus: true },
        children: [
          {
            path: ':hierarchyId',
            name: 'iam-role',
            component: SkynetHierarchyAndRole,
            authority: SYS_AUTHORITIES.AUTHORITY_HIERARCHY_AND_ROLE_VIEWABLE,
            props: true,
            params: {
              hierarchyId: 1,
            },
            meta: { hideBaseMenus: true },
          },
        ],
      },
      {
        path: 'organization',
        name: 'iam-organization-home',
        component: SkynetOrganizationAndPeople,
        props: true,
        meta: { hideBaseMenus: true },
        children: [
          {
            path: ':organizationId',
            name: 'iam-organization',
            component: SkynetOrganizationAndPeople,
            authority: SYS_AUTHORITIES.AUTHORITY_ORGANIZATION_AND_PEOPLE_VIEWABLE,
            props: true,
            params: {
              organizationId: 1,
            },
            meta: { hideBaseMenus: true },
          },
        ],
      },
    ],
  },
];

const loginRoute = {
  path: '/sso',
  name: 'login',
  component: SkynetLogin,
};

const notFoundRoute = {
  path: '/404',
  name: 'not-found',
  component: SkynetNotFoundPage,
};

const forbiddenRoute = {
  path: '/forbidden',
  name: 'forbidden',
  component: SkynetForbiddenPage,
};

const topLevelRoutes = [
  ...riskRoutes,
  ...dataRoutes,
  ...iamRoutes,
];

const homeRouter = {
  path: '/',
  name: 'home',
  component: SkynetHome,
  children: topLevelRoutes,
};

const uploadRouter = {
  path: '/upload',
  name: 'upload',
  component: SkynetUpload,
};

const initializerRouter = {
  path: '/initializer',
  name: 'initializer',
  component: SkynetInitializer,
};

const routes = [
  homeRouter,
  loginRoute,
  notFoundRoute,
  forbiddenRoute,
  initializerRouter,
];

const publicPages = [
  loginRoute.path,
  notFoundRoute.path,
  forbiddenRoute.path,
  initializerRouter.path,
];

if (isDevMode) {
  routes.push(uploadRouter);
  publicPages.push(uploadRouter.path);
}

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

const collectAuthoritiesOfRoute = (route, authoritiesOfRoute) => {
  if (!isEmpty(route.children)) {
    route.children.forEach(subRoute => collectAuthoritiesOfRoute(subRoute, authoritiesOfRoute));
  } else {
    authoritiesOfRoute.push(route.authority);
  }
};

const collectAllRoutes = (route, allRoutes) => {
  // eslint-disable-next-line
  route.authorities = [];
  collectAuthoritiesOfRoute(route, route.authorities);
  allRoutes.push(route);
  if (!isEmpty(route.children)) {
    route.children.forEach(subRoute => collectAllRoutes(subRoute, allRoutes));
  }
};

const allRoutes = [];
collectAllRoutes(homeRouter, allRoutes);

router.beforeEach((to, from, next) => {
  const { baseCode } = to.query;
  if (baseCode) {
    storeBase(baseCode);
    store.commit(UPDATE_CURRENT_BASE, baseCode);
  }

  /* eslint-disable */
  if (!history.pushState && location.toString().indexOf('#') === -1) {
    return next(location.pathname + location.search);
  }
  /* eslint-enable */

  if (publicPages.includes(to.path)) {
    return next();
  } else if (!getToken()) {
    return redirectToSSOLogin(to.path);
  }

  const routeTo = allRoutes.find(i => i.name === to.name);
  if (!routeTo) {
    return next(notFoundRoute);
  }

  if (isEmpty(routeTo.children) && !store.getters.userHasAuthority(routeTo.authority)) {
    return next(forbiddenRoute);
  }

  if (!isEmpty(routeTo.children)) {
    const firstPermittedSubRoute = routeTo.children.find(subRoute =>
      store.getters.userHasAuthoritiesIn(subRoute.authorities));
    return next(firstPermittedSubRoute || forbiddenRoute);
  }

  store.commit(HIDE_SUMB_MENU, { hideSubMenu: !!routeTo.hideSubMenu });
  return next();
});

export default router;

