import styles from './Home.module.scss';
import postService from '../../services/post/post.service';
import { useState } from 'react';
import { ArticleProvider } from '../../contexts/ArticleContext';
import CommentTab from '../../components/CommentTab';
import { DrawerProvider } from '../../contexts/DrawerContext';
import InfiniteScroller from '../../components/InfiniteScroll';

function Home({ initialPost = null, value = 'default' }) {
  //Comments
  const [activeComments, setActiveComments] = useState(false);
  //CurrentPost
  const [currentPost, setCurrentPost] = useState(null);

  const LIMIT = 5;

  // Infinite scroll fetcher
  const fetchPosts = async ({ cursor }) => {
    // const page = cursor || Math.ceil(Math.random() * 10); // nếu chưa có cursor thì bắt đầu từ 1
    const page = cursor || 1;
    try {
      let data;
      switch (value) {
        case 'default':
          data = await postService.getPosts(page, LIMIT);
          break;
        case 'following':
          data = await postService.GetFollowingPosts(page, LIMIT);
          break;
        case 'friend':
          data = await postService.GetFriendPosts(page, LIMIT);
          break;
      }
      return {
        data,
        hasMore: data.length === LIMIT,
        nextCursor: page + 1,
      };
    } catch (err) {
      console.error('Lỗi khi fetch posts:', err);
      return {
        data: [],
        hasMore: false,
        nextCursor: null,
      };
    }
  };

  return (
    <main className={styles.DivMainContainer}>
      <div className={styles.DivColumnListContainer}>
        <InfiniteScroller
          initialValue={initialPost ? [initialPost] : []}
          fetchData={fetchPosts}
          className={styles.DivColumnListContainer}
          extractKey={(post) => post.id}
          renderItem={(post) => (
            <ArticleProvider
              key={post.id}
              data={post}
              setActiveComments={setActiveComments}
              activeComments={activeComments}
              setPost={setCurrentPost}
            />
          )}
        />
      </div>
      <DrawerProvider isActive={activeComments} setActive={setActiveComments}>
        {currentPost && <CommentTab post={currentPost} />}
      </DrawerProvider>
    </main>
  );
}

export default Home;
