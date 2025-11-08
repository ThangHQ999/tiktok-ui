import {
  faClosedCaptioning,
  faFlag,
  faHeartBroken,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Icon from '../components/Icon/Icon';
import AutoscrollIcon from '../components/Icon/AutoScrollIcon';
import FloatingPlayerIcon from '../components/Icon/FloatingPlayerIcon';
import i18n from '../i18n';

export const getMenuItemVideo = () => {
  const t = i18n.getFixedT(null, 'popover');

  return [
    {
      label: t('menuItem.quality.quality'),
      secondaryText: t('menuItem.quality.auto'),
      icon: <Icon name="hd" />,
      action: () => console.log('Change quality'),
    },
    {
      label: t('menuItem.caption'),
      icon: <FontAwesomeIcon icon={faClosedCaptioning} />,
      action: () => console.log('Toggle captions'),
    },
    {
      label: t('menuItem.autoScroll'),
      icon: <AutoscrollIcon />,
      hasToggle: true,
      key: 'autoScroll',
    },
    {
      label: t('menuItem.floatingPlayer'),
      icon: <FloatingPlayerIcon />,
      action: () => console.log('Open floating player'),
    },
    {
      label: t('menuItem.notInterested'),
      icon: <FontAwesomeIcon icon={faHeartBroken} />,
      action: () => console.log('Mark as not interested'),
    },
    {
      label: t('menuItem.report'),
      icon: <FontAwesomeIcon icon={faFlag} />,
      action: () => console.log('Report video'),
      isDestructive: true,
    },
  ];
};
