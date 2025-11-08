import httpRequest from '../../utils/httpRequest';

export const createPost = async (data) => {
  try {
    const res = await httpRequest.post(`/posts`, data);
    return res;
  } catch (err) {
    console.error('Failed to create comment:', err);
    throw err;
  }
};

export const updatePost = async (slug, data) => {
  try {
    const res = await httpRequest.patch(`/posts/${slug}`, data);
    return res;
  } catch (error) {
    console.error('Failed to update comment:', error);
  }
};

export const deletePost = async (slug) => {
  try {
    const res = await httpRequest.del(`/posts/${slug}`);
    return res;
  } catch (error) {
    console.error('Failed to delete comment:', error);
  }
};

export const getPosts = async (page = 1, limit = 10) => {
  try {
    const res = await httpRequest.get(`/posts?page=${page}&limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
};

export const GetFollowingPosts = async (page = 1, limit = 10) => {
  try {
    const res = await httpRequest.get(
      `/posts/following?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
};

export const GetFriendPosts = async (page = 1, limit = 10) => {
  try {
    const res = await httpRequest.get(
      `/posts/friend?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
};

export const getPost = async (slug) => {
  try {
    const res = await httpRequest.get(`/posts/${slug}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
};

export const getFeaturedPost = async () => {
  try {
    const res = await httpRequest.get(`/posts/featured`);
    res.data = res.data.map((post) => ({
      ...post,
      author: {
        name: post.author_name,
        avatar: post.author_avatar,
        username: post.author_username,
      },
      topics: post.topics?.map((topic) => topic.name) || [],
      publishedAt: post.published_at,
      readTime: post.reading_time,
      featuredImage: post.cover_url,
      likes: Number(post.like_count),
      views: Number(post.like_count),
      comments: Number(post.comment_count),
    }));

    return res;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
};

export const getRelatedPost = async (preTopics) => {
  try {
    const res = await httpRequest.post(`/posts/related`, { topics: preTopics });
    res.data = res.data.map((post) => ({
      ...post,
      author: {
        name: post.author_name,
        avatar: post.author_avatar,
        username: post.author_username,
      },
      topics: post.topics?.map((topic) => topic.name) || [],
      publishedAt: post.published_at,
      readTime: post.reading_time,
      featuredImage: post.cover_url,
      likes: Number(post.like_count),
      views: Number(post.like_count),
      comments: Number(post.comment_count),
    }));

    return res;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
};

export const getLatestPost = async () => {
  try {
    const res = await httpRequest.get(`/posts/latest`);
    return res;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
};

export const getUserPostForEdit = async (slug) => {
  try {
    const res = await httpRequest.get(`/posts/edit/${slug}`);
    const data = res.data;
    const author = data.author || {};

    return {
      ...res,
      data: {
        ...data,
        author: {
          ...author,
          id: author.id,
          name: author.full_name,
          avatar: author.avatar_url,
          username: author.username,
        },
        topics: data.topics?.map((topic) => topic.name) || [],
        tags: data.tags?.map((tag) => tag.name) || [],
        publishedAt: data.published_at,
        readTime: data.reading_time,
        featuredImage: data.cover_url,
      },
    };
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
};

export default {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getUserPostForEdit,
  getPost,
  getRelatedPost,
  getFeaturedPost,
  getLatestPost,
  GetFollowingPosts,
  GetFriendPosts,
};
