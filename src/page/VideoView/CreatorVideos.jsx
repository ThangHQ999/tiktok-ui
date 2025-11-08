import { useEffect, useState } from 'react';
import userService from '../../services/user/user.service';
import VideoList from '../../components/VideoList';

function CreatorVideos({ username }) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      const postData = await userService.getUserPosts(username);
      setPosts(postData);
    };
    fetchPosts();
  }, [username]);
  return <VideoList variant="profile" videosData={posts} />;
}

export default CreatorVideos;
