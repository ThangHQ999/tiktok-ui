import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsis,
  faFire,
  faGear,
  faPenToSquare,
  faShare,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

import defaultAvatar from '../../assets/imgs/defaultAvatar.jpeg';
import styles from './styles.module.scss';
import Button from '../../components/Button';
import ProtectedButton from '../../components/ProtectedButton';
import ShareModal from '../../components/ShareModal';
import { useDispatch, useSelector } from 'react-redux';
import { ModalProvider } from '../../contexts/ModalContext';
import EditProfile from '../../components/EditProfile';
import formatNumberShort from '../../utils/formatNumberShort';
import '../../components/Button/Button.css';
import { Tab, TabPanel, TabPanels, Tabs } from '../../components/Tabs/Tabs';
import SegmentControl from '../../components/SegmentControl';
import Error from '../../components/Error';
import VideoList from '../../components/VideoList';
import FollowModal from '../../components/FollowModal';
import userService from '../../services/user/user.service';
import conversationService from '../../services/conversation/conversation.service';
import { useNavigate } from 'react-router-dom';
import { setSelectedConversation } from '../../features/conversation/conversationSlice';
import followService from '../../services/follow/follow.service';
import LikedPanel from './LikedPanel';
import RepostPanel from './RepostPanel';

function Profile({ profile }) {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isSelf = currentUser?.username === profile?.username;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [follow, setFollow] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowings] = useState(0);
  const [activeShare, setActiveShare] = useState(false);
  const [activeEdit, setActiveEdit] = useState(false);
  const [activeFollow, setActiveFollow] = useState(false);
  const [defaultValueFollow, setDefaultValueFollow] = useState('');

  const [posts, setPosts] = useState([]);
  useEffect(() => {
    if (profile) {
      setFollow(profile.isFollow ?? false);
      setFollowers(profile.followerCount ?? 0);
      setFollowings(profile.followingCount ?? 0);
    }
  }, [profile]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postData = await userService.getUserPosts(profile.username);
      setPosts(postData);
    };
    fetchPosts();
  }, [profile.username]);

  const toggleFollow = async () => {
    try {
      if (follow) {
        await followService.unfollow({
          followAbleId: profile.id,
          type: 'user',
        });
      } else {
        await followService.follow({ followAbleId: profile.id, type: 'user' });
      }
      setFollow((prev) => !prev);
      setFollowers((prev) => (follow ? prev - 1 : prev + 1));
    } catch (err) {
      console.log(err);
    }
  };
  if (!profile) {
    return (
      <Error
        title="Profile not found"
        icon={<FontAwesomeIcon icon={faUser} />}
      />
    );
  }

  return (
    <div className={styles.UserContainer}>
      <div className={styles[`DivShareLayoutBase-StyledShareLayoutV2`]}>
        <div className={styles.DivShareLayoutContentV2}>
          <div
            className={
              styles[
                `DivShareLayoutHeader-StyledDivShareLayoutHeaderV2-CreatorPageHeader`
              ]
            }
          >
            <div
              className={styles.DivContainer}
              style={{ width: '212px', height: '212px' }}
            >
              <span
                className={styles[`SpanAvatarContainer-StyledAvatar`]}
                style={{ width: '212px', height: '212px' }}
              >
                <img
                  src={profile?.avatar || defaultAvatar}
                  alt=""
                  className={styles.ImgAvatar}
                />
              </span>
            </div>
            <div
              className={
                styles[`DivShareTitleContainer-CreatorPageHeaderShareContainer`]
              }
            >
              <div
                className={clsx(
                  styles.DivUserIdentifierWrapper,
                  styles.userName
                )}
              >
                <div
                  className={clsx(
                    styles.DivUserTextWrapper,
                    styles.textUserName
                  )}
                >
                  <h1
                    className={clsx(
                      styles.H1ShareSubTitle,
                      styles.textUserName
                    )}
                  >
                    {profile?.username}
                  </h1>
                  <h2 className={styles.H2ShareSubTitle}>{profile?.name}</h2>
                </div>
              </div>
              <div
                className={clsx(
                  styles.DivButtonPanelWrapper,
                  styles.actionsProfile
                )}
              >
                {isSelf ? (
                  <>
                    <Button
                      label="Sửa hồ sơ"
                      icon={<FontAwesomeIcon icon={faPenToSquare} />}
                      isDefault
                      responsiveButton
                      size="medium"
                      primary
                      onClick={() => setActiveEdit(!activeEdit)}
                    />
                    {activeEdit && (
                      <ModalProvider isActive={activeEdit}>
                        <EditProfile />
                      </ModalProvider>
                    )}
                    <Button
                      label="Quảng bá bài đăng"
                      icon={<FontAwesomeIcon icon={faFire} />}
                      isDefault
                      responsiveButton
                      size="medium"
                      secondary
                    />
                    <Button
                      to="/setting"
                      icon={<FontAwesomeIcon icon={faGear} />}
                      isDefault
                      iconOnlyButton
                      size="medium"
                      secondary
                    />
                    <Button
                      icon={<FontAwesomeIcon icon={faShare} />}
                      isDefault
                      iconOnlyButton
                      size="medium"
                      secondary
                      onClick={() => setActiveShare(true)}
                    />
                  </>
                ) : (
                  <>
                    <ProtectedButton onClick={toggleFollow}>
                      <Button
                        label={follow ? 'Hủy theo dõi' : 'Theo dõi'}
                        isDefault
                        size="medium"
                        primary
                        style={{
                          backgroundColor: follow
                            ? 'rgba(255, 255, 255, 0.12)'
                            : 'var(--ui-shape-primary)',
                        }}
                      />
                    </ProtectedButton>
                    <ProtectedButton
                      onClick={async () => {
                        const res =
                          await conversationService.getOrCreateConversation(
                            profile?.id
                          );
                        dispatch(setSelectedConversation(res));
                        navigate(`/messages?conversation=${res.id}`);
                      }}
                    >
                      <Button
                        label="Nhắn tin"
                        isDefault
                        size="medium"
                        secondary
                      />
                    </ProtectedButton>
                    <Button
                      icon={<FontAwesomeIcon icon={faShare} />}
                      isDefault
                      iconOnlyButton
                      size="medium"
                      secondary
                      onClick={() => setActiveShare(true)}
                    />
                    <Button
                      icon={<FontAwesomeIcon icon={faEllipsis} />}
                      isDefault
                      iconOnlyButton
                      size="medium"
                      secondary
                    />
                  </>
                )}
                {activeShare && (
                  <ShareModal
                    isSharePost={false}
                    isOpen={activeShare}
                    onClose={() => setActiveShare(false)}
                    shareToFriends={false}
                  />
                )}
              </div>
              <div
                className={clsx(
                  styles.CreatorPageHeaderTextContainer,
                  styles.moreUserInfo
                )}
              >
                <h3 className={styles.H3CountInfos}>
                  <div className={styles.DivNumber}>
                    <strong title="Following">
                      {formatNumberShort(following)}
                    </strong>
                    <span
                      className={styles.SpanUnit}
                      onClick={() => {
                        setDefaultValueFollow('following');
                        setActiveFollow(true);
                      }}
                    >
                      Đã follow
                    </span>
                  </div>
                  <div className={styles.DivNumber}>
                    <strong title="Followers">
                      {formatNumberShort(followers)}
                    </strong>
                    <span
                      className={styles.SpanUnit}
                      onClick={() => {
                        setDefaultValueFollow('followers');
                        setActiveFollow(true);
                      }}
                    >
                      Follower
                    </span>
                  </div>
                  <div className={styles.DivNumber}>
                    <strong title="Likes">
                      {formatNumberShort(profile?.likeCount || 0)}
                    </strong>
                    <span className={styles.SpanUnit}>Lượt thích</span>
                  </div>
                </h3>
                {activeFollow && (
                  <ModalProvider isActive={activeFollow}>
                    <FollowModal
                      data={profile}
                      defaultValue={defaultValueFollow}
                      onClose={() => setActiveFollow(false)}
                    />
                  </ModalProvider>
                )}
                <h2 className={styles.H2ShareDes}>
                  {profile?.bio || 'Chưa có tiểu sử.'}
                </h2>
              </div>
            </div>
          </div>
          <Tabs
            defaultValue={'videos-latest'}
            className={styles.DivShareLayoutMain}
            style={{ minWidth: '0px' }}
          >
            <div className={styles.DivFeedTabWrapper}>
              <div className={styles.DivVideoFeedTab}>
                <Tab value={'videos-latest'}>
                  <p
                    aria-selected="true"
                    role="tab"
                    data-e2e="videos-tab"
                    tabIndex="0"
                    className={styles.PPost}
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                    >
                      <path d="M11 8a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2Zm0 18a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V27a1 1 0 0 0-1-1h-2ZM22 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9Zm1 17a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V27a1 1 0 0 0-1-1h-2ZM34 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9Zm1 17a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V27a1 1 0 0 0-1-1h-2Z"></path>
                    </svg>
                    <span>Video</span>
                  </p>
                </Tab>
                <Tab value={'repost'}>
                  <p
                    aria-selected="false"
                    role="tab"
                    data-e2e="repost-tab"
                    tabIndex="0"
                    className={styles.PRepost}
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                    >
                      <path d="M37.7 15v19.7l3.48-3.7a.7.7 0 0 1 .99-.03l1.46 1.37c.28.26.3.7.03.99l-6.26 6.66a2.3 2.3 0 0 1-3.34.01l-6.36-6.66a.7.7 0 0 1 .02-.99l1.45-1.38a.7.7 0 0 1 .99.02l4.14 4.34V15a4.3 4.3 0 0 0-4.3-4.3h-3.5a.7.7 0 0 1-.7-.7V8c0-.39.31-.7.7-.7H30a7.7 7.7 0 0 1 7.7 7.7ZM17.84 17.34 13.7 13v20a4.3 4.3 0 0 0 4.3 4.3h3.5c.39 0 .7.31.7.7v2a.7.7 0 0 1-.7.7H18a7.7 7.7 0 0 1-7.7-7.7V13.63l-3.48 3.7a.7.7 0 0 1-.99.03L4.37 16a.7.7 0 0 1-.03-.98l6.26-6.67a2.3 2.3 0 0 1 3.34-.01l6.36 6.66a.7.7 0 0 1-.02.99l-1.45 1.38a.7.7 0 0 1-.99-.02Z"></path>
                    </svg>
                    <span>Bài đăng lại</span>
                  </p>
                </Tab>
                <Tab value={'favorite'}>
                  <p
                    aria-selected="false"
                    role="tab"
                    tabIndex="0"
                    className={styles.PFavorite}
                    style={{ display: 'none' }}
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                    >
                      <path d="M10.5 11A4.5 4.5 0 0 1 15 6.5h18a4.5 4.5 0 0 1 4.5 4.5v28a1.5 1.5 0 0 1-2.38 1.21L24 32.14 12.88 40.2A1.5 1.5 0 0 1 10.5 39V11ZM15 9.5c-.83 0-1.5.67-1.5 1.5v25.06l9.62-7a1.5 1.5 0 0 1 1.76 0l9.62 7V11c0-.83-.67-1.5-1.5-1.5H15Z"></path>
                    </svg>
                    <span>Sở thích</span>
                  </p>
                </Tab>
                <Tab value={'liked'}>
                  <p
                    aria-selected="false"
                    role="tab"
                    data-e2e="liked-tab"
                    tabIndex="0"
                    className={styles.PLike}
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                    >
                      <path d="M8.71 10.56c4.24-4.2 10.93-4.15 15.29.63 4.36-4.78 11.05-4.84 15.29-.63a10.82 10.82 0 0 1 2.82 10.55L39.5 18.5c.06-2.1-.71-4.21-2.32-5.81-3.06-3.03-7.92-3.03-11.17.75l-.03.04-.92.91a1.5 1.5 0 0 1-2.12 0l-.92-.91-.03-.04c-3.25-3.78-8.11-3.78-11.17-.75a7.82 7.82 0 0 0 0 11.12L24 36.89l1.95-1.94 2.12 2.12-3.01 3a1.5 1.5 0 0 1-2.12 0L8.71 25.93a10.82 10.82 0 0 1 0-15.38Zm33.14 21.3a16.64 16.64 0 0 0 2.25-2.68 4 4 0 0 0 .22-.41c.04-.09.18-.4.18-.77 0-.3-.09-.56-.12-.64a8.38 8.38 0 0 0-.68-1.32c-.43-.67-1.07-1.5-1.91-2.31a11.15 11.15 0 0 0-10.85-2.8l2.57 2.58.49-.01c2.5 0 4.4 1.14 5.71 2.4a9.87 9.87 0 0 1 1.63 2.02 13.67 13.67 0 0 1-1.6 1.8l2.11 2.13Zm-5.84.27c-.65.24-1.33.37-2.01.37-1.95 0-3.85-1.1-5.37-2.44a13.9 13.9 0 0 1-1.97-2.14l.17-.26a9.87 9.87 0 0 1 2.26-2.45L36 32.13Zm-9.06-9.06a12.74 12.74 0 0 0-3.17 3.89c-.06.13-.12.27-.16.4-.03.08-.12.34-.12.64 0 .37.14.68.18.76a9.6 9.6 0 0 0 .84 1.3c.51.66 1.23 1.47 2.12 2.25 1.74 1.54 4.34 3.19 7.36 3.19 1.57 0 3.02-.44 4.3-1.08l1.93 1.93a1 1 0 0 0 1.42 0l.7-.7a1 1 0 0 0 0-1.42L27.77 19.65a1 1 0 0 0-1.42 0l-.7.7a1 1 0 0 0 0 1.42l1.3 1.3Z"></path>
                    </svg>
                    <span>Đã thích</span>
                  </p>
                </Tab>
              </div>
              <SegmentControl />
            </div>
            {profile.status !== 'banned' ? (
              <TabPanels>
                <TabPanel value={'videos-latest'}>
                  {posts.length > 0 ? (
                    <VideoList variant="profile" videosData={posts} />
                  ) : (
                    <Error
                      title={
                        isSelf
                          ? 'Tải lên video đầu tiên của bạn'
                          : 'Không có nội dung'
                      }
                      desc={
                        isSelf
                          ? 'Video của bạn sẽ xuất hiện ở đây'
                          : 'Người dùng này chưa đăng bất kỳ video nào.'
                      }
                      icon={
                        <div className={styles.DivErrorIconWrapper}>
                          <svg
                            fill="currentColor"
                            color="inherit"
                            fontSize="44px"
                            viewBox="0 0 48 48"
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                          >
                            <path d="M4 28a2.5 2.5 0 0 1 2.5-2.5H20a2.5 2.5 0 0 1 2.5 2.5v13.5A2.5 2.5 0 0 1 20 44H6.5A2.5 2.5 0 0 1 4 41.5V28Zm4 1.5V40h10.5V29.5H8ZM25.5 28a2.5 2.5 0 0 1 2.5-2.5h13.5A2.5 2.5 0 0 1 44 28v13.5a2.5 2.5 0 0 1-2.5 2.5H28a2.5 2.5 0 0 1-2.5-2.5V28Zm4 1.5V40H40V29.5H29.5ZM25.5 6.5A2.5 2.5 0 0 1 28 4h13.5A2.5 2.5 0 0 1 44 6.5V20a2.5 2.5 0 0 1-2.5 2.5H28a2.5 2.5 0 0 1-2.5-2.5V6.5Zm4 1.5v10.5H40V8H29.5ZM4 6.5A2.5 2.5 0 0 1 6.5 4H20a2.5 2.5 0 0 1 2.5 2.5V20a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 20V6.5ZM8 8v10.5h10.5V8H8Z"></path>
                          </svg>
                        </div>
                      }
                    />
                  )}
                </TabPanel>
                <TabPanel value={'videos-popular'}>
                  <VideoList variant="profile" videosData={posts} />
                </TabPanel>
                <TabPanel value={'videos-oldest'}>
                  <VideoList variant="profile" videosData={posts.reverse()} />
                </TabPanel>
                <TabPanel value={'favorite'}>
                  <VideoList variant="profile" videosData={posts} />
                </TabPanel>
                <TabPanel value={'repost'}>
                  <RepostPanel profile={profile} />
                </TabPanel>
                <TabPanel value={'liked'}>
                  <LikedPanel profile={profile} />
                </TabPanel>
              </TabPanels>
            ) : (
              <div className={styles.banned}>
                <h1>Tài khoản bị cấm</h1>
                <p>Tài khoản {profile.username} không còn có sẵn nữa</p>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

Profile.propTypes = {
  profile: PropTypes.object.isRequired,
};

export default Profile;
