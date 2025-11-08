import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Error from '../../components/Error';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import VideoList from '../../components/VideoList';
import { useEffect, useState } from 'react';
import likeService from '../../services/like/like.service';

function LikedPanel({ isLocked = false, profile }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!profile || !profile.id) return;

    const fetchPosts = async () => {
      const res = await likeService.getLikedUserId({
        likeAbleId: profile.id,
        type: 'post',
      });
      setPosts(res.posts || []);
    };

    fetchPosts();
  }, [profile]);

  if (!profile) return null;

  return (
    <>
      {!isLocked ? (
        <VideoList variant="profile" videosData={posts} />
      ) : (
        <Error
          title={'Video được người dùng này thích là riêng tư'}
          desc={`Video được ${profile.username} thích hiện đang bị ẩn`}
          icon={
            <FontAwesomeIcon
              icon={faLock}
              style={{
                width: '90px',
                height: '90px',
                opacity: '0.34',
              }}
            />
          }
        />
      )}
    </>
  );
}

export default LikedPanel;
