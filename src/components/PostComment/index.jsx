import Comment from '../Comment';
import CommentInputBox from '../CommentInputBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faSearch } from '@fortawesome/free-solid-svg-icons';

import styles from './PostComment.module.scss';
import { useSelector } from 'react-redux';
import ProtectedButton from '../ProtectedButton';
import { useEffect, useState } from 'react';
import commentService from '../../services/comment/comment.service';
import socketClient from '../../utils/socketClient';

function PostComment({ post }) {
  const topSearch = 'nga và mỹ';
  // const mockComments = [
  //   {
  //     id: 23,
  //     postId: 4,
  //     content: 'Đây là cái gì v',
  //     likes: 234,
  //     isLiked: false,
  //     isAuthorLiked: true,
  //     author: {
  //       id: 6,
  //       username: 'dang',
  //       name: 'Đăng đẹp trai',
  //       avatar:
  //         'https://maunaildep.com/wp-content/uploads/2025/04/anh-gai-xinh-k10-dam.jpg',
  //       followers: 2345,
  //       likes: 2395,
  //     },
  //     replies: [
  //       {
  //         id: 23,
  //         postId: 4,
  //         content: 'Đây là qq gì v',
  //         likes: 234,
  //         isLiked: true,
  //         isAuthorLiked: false,
  //         author: {
  //           id: 7,
  //           username: 'dansg',
  //           name: 'Đăng đần',
  //           avatar:
  //             'https://maunaildep.com/wp-content/uploads/2025/04/anh-gai-xinh-k10-chan-dai.jpg',
  //           followers: 2345,
  //           likes: 2395,
  //         },
  //         parentId: 23,
  //         sender: 'other',
  //         createdAt: '2025-08-14 18:14:16.868',
  //       },
  //       {
  //         id: 26,
  //         postId: 4,
  //         content: 'Đây là qq gì v',
  //         likes: 234,
  //         isLiked: true,
  //         parentId: 23,
  //         isAuthorLiked: true,
  //         author: {
  //           id: 7,
  //           username: 'dangd',
  //           name: 'Đăng đần',
  //           avatar:
  //             'https://maunaildep.com/wp-content/uploads/2025/04/anh-gai-xinh-k10-chan-dai.jpg',
  //           followers: 2345,
  //           likes: 25,
  //         },
  //         sender: 'other',
  //         createdAt: '2025-08-14 18:14:16.868',
  //       },
  //     ],
  //     sender: 'other',
  //     createdAt: '2025-08-14 18:14:16.868',
  //   },
  //   {
  //     id: 28,
  //     postId: 4,
  //     content: 'Đây là cái gì v',
  //     likes: 234,
  //     isLiked: false,
  //     isAuthorLiked: true,
  //     author: {
  //       id: 6,
  //       username: 'dang',
  //       name: 'Đăng đẹp trai',
  //       avatar:
  //         'https://maunaildep.com/wp-content/uploads/2025/04/anh-gai-xinh-k10-dam.jpg',
  //       followers: 2345,
  //       likes: 2395,
  //     },
  //     replies: [
  //       {
  //         id: 23,
  //         postId: 4,
  //         content: 'Đây là qq gì v',
  //         likes: 234,
  //         isLiked: true,
  //         isAuthorLiked: false,
  //         author: {
  //           id: 1,
  //           username: 'dansg',
  //           name: 'Đăng đần',
  //           avatar:
  //             'https://maunaildep.com/wp-content/uploads/2025/04/anh-gai-xinh-k10-chan-dai.jpg',
  //           followers: 2345,
  //           likes: 2395,
  //         },
  //         parentId: 23,
  //         sender: 'other',
  //         createdAt: '2025-08-14 18:14:16.868',
  //       },
  //       {
  //         id: 26,
  //         postId: 4,
  //         content: 'Đây là qq gì v',
  //         likes: 234,
  //         isLiked: true,
  //         parentId: 23,
  //         isAuthorLiked: true,
  //         author: {
  //           id: 8,
  //           username: 'dangd',
  //           name: 'Đăng đần',
  //           avatar:
  //             'https://maunaildep.com/wp-content/uploads/2025/04/anh-gai-xinh-k10-chan-dai.jpg',
  //           followers: 2345,
  //           likes: 25,
  //         },
  //         sender: 'other',
  //         createdAt: '2025-08-14 18:14:16.868',
  //       },
  //     ],
  //     sender: 'other',
  //     createdAt: '2025-08-14 18:14:16.868',
  //   },
  // ];
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [comments, setComments] = useState([]);
  const [reply, setReply] = useState(null);

  const postId = post.id;
  useEffect(() => {
    const fetchComments = async () => {
      const res = await commentService.getCommentsByPostId(postId);
      setComments(res.comments);
    };
    fetchComments();
  }, [postId]);

  const addReplyToComments = (comments, parentId, newReply) => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComments(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  useEffect(() => {
    if (!postId) return;
    const pusher = socketClient;

    const channel = pusher.subscribe(`post-${postId}-comments`);
    channel.bind('new-comment', (newComment) => {
      if (newComment.parentId === null) {
        setComments((prev) => [newComment, ...prev]);
      } else {
        setComments((prev) =>
          addReplyToComments(prev, newComment.parentId, newComment)
        );
      }
    });
    channel.bind('updated-comment', (editComment) => {
      const updateCommentRecursively = (comments) => {
        return comments.map((comment) => {
          if (comment.id === editComment.id) {
            return {
              ...comment,
              content: editComment.content,
              isEdited: true,
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentRecursively(comment.replies),
            };
          }
          return comment;
        });
      };
      setComments((prev) =>
        updateCommentRecursively(prev, editComment.id, editComment.content)
      );
    });
    channel.bind('delete-comment', (commentId) => {
      const deleteCommentRecursively = (comments) => {
        return comments.filter((comment) => comment.id !== commentId);
      };
      setComments((prev) => deleteCommentRecursively(prev));
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [postId]);

  return (
    <div>
      {/* <div data-e2e="search-comment-top" className={styles.DivCommentTop}>
        <span className={styles.SpanHint}>Tìm kiếm:</span>
        &nbsp;
        <span className={styles.SpanWordContainer}>
          <span data-e2e="search-comment-top-word" className={styles.SpanWord}>
            {topSearch}
          </span>
          <FontAwesomeIcon
            icon={faSearch}
            className={styles.StyledMagnifyingGlass}
          />
        </span>
        <div className={styles.DivActionContainer}>
          <div
            aria-label="thêm"
            role="button"
            tabIndex={0}
            className={styles.DivMoreContainer}
          >
            <FontAwesomeIcon icon={faEllipsis} />
          </div>
        </div>
      </div> */}
      <div style={{ marginBottom: '90px' }}>
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            data={comment}
            post={post}
            setReply={setReply}
            reply={reply}
          />
        ))}
      </div>
      <div
        className={styles.DivBottomCommentContainer}
        style={{
          position: 'fixed',
          width: '484px',
          zIndex: '2',
          bottom: '0px',
          marginLeft: '0px',
        }}
      >
        <div className={styles.DivBorder}></div>
        <div className={styles.DivCommentInputContainer}>
          <div className={styles.DivLayoutContainer}>
            {isAuth ? (
              <div className={styles.DivCommentBarContainer}>
                <div className={styles.DivCommentInputWrapper}>
                  <CommentInputBox postId={postId} replyId={null} />
                </div>
              </div>
            ) : (
              <ProtectedButton>
                <div className={styles.DivLoginBar}>
                  <span className={styles.SpanLogin}>Đăng nhập</span> để bình
                  luận
                </div>
              </ProtectedButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostComment;
