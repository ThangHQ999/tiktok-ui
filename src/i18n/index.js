import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './en/common.json';
import viCommon from './vi/common.json';
import arCommon from './ar/common.json';

import enMoreDrawer from './en/moreDrawer.json';
import viMoreDrawer from './vi/moreDrawer.json';
import arMoreDrawer from './ar/moreDrawer.json';

import viExplore from './vi/explore.json';
import enExplore from './en/explore.json';

import viProfile from './vi/profile.json';
import viComment from './vi/comment.json';
import viHome from './vi/home.json';
import viNotification from './vi/notification.json';
import viPopover from './vi/popover.json';
import viSearch from './vi/search.json';

import enProfile from './en/profile.json';
import enComment from './en/comment.json';
import enHome from './en/home.json';
import enNotification from './en/notification.json';
import enPopover from './en/popover.json';
import enSearch from './en/search.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      moreDrawer: enMoreDrawer,
      home: enHome,
      explore: enExplore,
      search: enSearch,
      comment: enComment,
      notification: enNotification,
      profile: enProfile,
      popover: enPopover,
    },
    vi: {
      common: viCommon,
      moreDrawer: viMoreDrawer,
      home: viHome,
      explore: viExplore,
      search: viSearch,
      comment: viComment,
      notification: viNotification,
      profile: viProfile,
      popover: viPopover,
    },
    ar: {
      common: arCommon,
      moreDrawer: arMoreDrawer,
    },
  },
  lng: 'vi',
  fallbackLng: 'en',
  ns: ['common', 'home'],
  defaultNS: 'common',

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
