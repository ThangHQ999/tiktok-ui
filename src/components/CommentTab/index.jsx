import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import Comment from '../Comment';

import { useEffect, useState } from 'react';
import Button from '../Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useDrawer } from '../../contexts/DrawerContext';
import Text from '../Text';
import CommentInputBox from '../CommentInputBox';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import socketClient from '../../utils/socketClient';
import commentService from '../../services/comment/comment.service';
import ProtectedButton from '../ProtectedButton';

function CommentTab({ post }) {
  const postId = post.id;
  const { closeDrawer } = useDrawer();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [commentsList, setComments] = useState([]);
  const [reply, setReply] = useState(null);

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
    <div
      className={clsx(
        styles.DivCommentSidebarTransitionWrapper,
        'comment-sidebar-transition-enter-done'
      )}
    >
      <section
        className={
          styles['BaseCommentContainerStyles-SectionCommentSidebarContainer']
        }
      >
        <div className={styles.DivCommentHeader}>
          <div className={styles.DivCommentHeaderTextWrapper}>
            <Text
              as="h4"
              weight={'bold'}
              className="StyledTUXText"
              style={{ fontSize: '15px', color: 'inherit' }}
            >
              Comments
            </Text>
            <Text
              as="h4"
              weight={'medium'}
              className="StyledTUXText"
              style={{ fontSize: '15px', color: 'inherit' }}
            >
              {`(${post.commentCount})`}
            </Text>
          </div>
          <div className={styles.DivCloseButtonWrapper}>
            <div className={styles['css-1dux0b3']}>
              <Button
                capsule
                size="medium"
                secondary
                className={styles['css-1rxmjnh']}
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  padding: '0px',
                  minWidth: '1.75rem',
                }}
                icon={<FontAwesomeIcon icon={faClose} />}
                onClick={closeDrawer}
              />
            </div>
          </div>
        </div>
        <div className={styles.DivCommentMain}>
          <div className={styles.DivCommentListContainer}>
            {commentsList.map(
              (comment) =>
                commentsList && (
                  <Comment
                    key={comment.id}
                    data={comment}
                    post={post}
                    reply={reply}
                    setReply={setReply}
                  />
                )
            )}
          </div>
        </div>
        <div className={styles.DivCommentFooter}>
          {isAuth ? (
            <div className={styles.DivCommentBarContainer}>
              <div className={styles.DivCommentInputWrapper}>
                <CommentInputBox postId={postId} />
              </div>
            </div>
          ) : (
            <ProtectedButton>
              <div className={styles.DivLoginBar}>
                <span className={styles.SpanLogin}>Đăng nhập</span> để bình luận
              </div>
            </ProtectedButton>
          )}
        </div>
      </section>
    </div>
  );
}

CommentTab.propTypes = {
  postId: PropTypes.number.isRequired,
};

export default CommentTab;
