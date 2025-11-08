import { useEffect, useState } from 'react';

import styles from './FollowModal.module.scss';
import followService from '../../services/follow/follow.service';
import formatNumberShort from '../../utils/formatNumberShort';
import UserInfo from '../UserInfo';
import { Tab, TabList, TabPanel, TabPanels, useTabs } from '../Tabs/Tabs';
import { useSelector } from 'react-redux';

function TabsFollow({ profile }) {
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [data, setData] = useState(null);
  const { activeValue } = useTabs();

  useEffect(() => {
    const fetchData = async () => {
      let res;
      switch (activeValue) {
        case 'following':
          res = await followService.getFollowing({
            type: 'user',
            userId: profile.id,
          });
          break;
        case 'follower':
          res = await followService.getFollowers({
            type: 'user',
            followAbleId: profile.id,
          });
          break;
        default:
          res = await followService.getFollowers({
            type: 'user',
            followAbleId: profile.id,
          });
          break;
      }
      setData(res);
    };
    fetchData();
  }, [activeValue, profile.id]);

  if (!profile) return null;

  return (
    <>
      <div className={styles.DivTabs}>
        <TabList>
          <Tab value="following">
            <div className={styles.s}>
              <div>Following</div>
              <strong>{formatNumberShort(profile.followingCount)}</strong>
            </div>
          </Tab>
          <Tab value="followers">
            <div className={styles.DivTabItem}>
              <div>Followers</div>
              <strong>{formatNumberShort(profile.followerCount)}</strong>
            </div>
          </Tab>
          {currentUser.id === profile.id && (
            <Tab value="friends">
              <div className={styles.DivTabItem}>
                <div>Friends</div>
                <strong>{formatNumberShort(profile.friendsCount || 0)}</strong>
              </div>
            </Tab>
          )}
          <Tab value="suggested">
            <div className={styles.DivTabItem}>Suggested</div>
          </Tab>
        </TabList>
      </div>
      {/* Panels */}
      <TabPanels>
        <TabPanel value="followers">
          <ul className={styles.DivUserListContainer}>
            {data?.users.map((u) => (
              <li key={u.id} className={styles.ListUser}>
                <UserInfo user={u} showFollowButton={u.id !== currentUser.id} />
              </li>
            ))}
          </ul>
        </TabPanel>

        <TabPanel value="following">
          <ul className={styles.DivUserListContainer}>
            {data?.users.map((u) => (
              <li key={u.id} className={styles.ListUser}>
                <UserInfo user={u} showFollowButton={u.id !== currentUser.id} />
              </li>
            ))}
          </ul>
        </TabPanel>

        <TabPanel value="suggested">
          <ul className={styles.DivUserListContainer}>
            {data?.users.map((u) => (
              <li key={u.id} className={styles.ListUser}>
                <UserInfo user={u} showFollowButton={u.id !== currentUser.id} />
              </li>
            ))}
          </ul>
        </TabPanel>
      </TabPanels>
    </>
  );
}

export default TabsFollow;
