import { useEffect, useState, useRef } from 'react';
import styles from './DirectMessages.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClose,
  faEllipsis,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import ChatInput from '../../components/ChatInput';
import { Link, useSearchParams } from 'react-router-dom';
import { ModalProvider } from '../../contexts/ModalContext';
import MediaModal from '../../components/MediaModal';
import clsx from 'clsx';
import EmojiPanel from '../../components/EmojiPanel';
import useClickOutside from '../../hooks/useClickOutside';
import ReactionIcon from '../../components/Icon/ReactionIcon';
import ReactionPicker from '../../components/ReactionPicker';
import { useDispatch, useSelector } from 'react-redux';
import messageService from '../../services/message/message.service';
import mediaService from '../../services/media/media.service';
import anyUrlToFile from '../../utils/anyUrlToFile';
import socketClient from '../../utils/socketClient';
import { setSelectedConversation } from '../../features/conversation/conversationSlice';
import conversationService from '../../services/conversation/conversation.service';
import InfiniteScroll from 'react-infinite-scroll-component';

// --- (Mock data không còn cần thiết, nhưng tôi giữ lại nếu bạn muốn tham khảo) ---
/*
const mockSelectedConversation = { ... };
const mockMessages = [ ... ];
*/

// Tách hàm render item ra cho sạch
function MessageItem({
  mes,
  i,
  currentUser,
  handleReaction,
  setReply,
  setViewMedia,
  setMedia,
}) {
  const type = mes.type;
  if (mes.isSystem && type === 'time') {
    return (
      <div key={i} className={styles.DivTimeContainer}>
        <span tabIndex={0}>{mes.content}</span>
      </div>
    );
  }
  if (mes.isSystem && type === 'notification') {
    return (
      <div key={i} data-e2e="chat-item" className={styles.DivChatItemWrapper}>
        <p className={styles.PChatTipContainer}>{mes.content}</p>
      </div>
    );
  }

  // Logic isOwnMessage, đảm bảo tin nhắn từ API cũng được nhận diện
  const isOwn = mes.isOwnMessage || mes.author?.id === currentUser?.id;

  return (
    <div
      key={mes.id || i} // Luôn ưu tiên mes.id
      data-e2e="chat-item"
      className={styles.DivChatItemWrapper}
    >
      <div
        className={clsx(
          styles.DivMessageVerticalContainer,
          isOwn ? styles.MyMessage : ''
        )}
      >
        {mes.replyTo && (
          <>
            <div className={styles.DivChatItemSenderNameContainer}>
              Trả lời tới{' '}
              {mes.replyTo.isOwnMessage ? 'bạn' : mes.replyTo.author.name}
            </div>
            <div className={styles.DivRefTextContent}>
              <div className={styles.DivMaxTwoLine}>
                {mes.replyTo.type === 'text'
                  ? mes.replyTo.content
                  : mes.replyTo.type}
              </div>
            </div>
          </>
        )}
        <div
          tabIndex={0}
          data-area="Actions"
          className={
            styles[
              isOwn
                ? 'DivMyMessageHorizontalContainer'
                : 'DivMessageHorizontalContainer'
            ]
          }
        >
          <Link
            target="_blank"
            rel="opener"
            tabIndex={-1}
            className={styles.StyledLink}
            to={`/@${mes.author?.username}`}
          >
            <span
              shape="circle"
              data-e2e="chat-avatar"
              className={styles.SpanAvatarContainer}
              style={{ width: '32px', height: '32px' }}
            >
              {mes.author?.avatar && (
                <img
                  loading="lazy"
                  alt=""
                  src={mes.author.avatar}
                  className={styles.ImgAvatar}
                />
              )}
            </span>
          </Link>
          {type === 'text' && (
            <div>
              <div
                className={clsx(
                  styles.DivTextContainer,
                  isOwn ? styles.MyTextMessage : ''
                )}
              >
                <p className={styles.PText}>{mes.content}</p>
              </div>
            </div>
          )}
          {(type === 'image' || type === 'video') && (
            <div>
              <div className={styles.DivCommonContainer}>
                <div className={styles.DivImageVideoMessageContainer}>
                  <div
                    className={styles.DivContainer}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'relative',
                    }}
                  >
                    {type === 'image' ? (
                      <img
                        src={mes.content}
                        alt="image message"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onClick={() => {
                          setMedia(mes.content);
                          setViewMedia(true);
                        }}
                      />
                    ) : (
                      <video
                        src={mes.content}
                        controls
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onClick={() => {
                          setMedia(mes.content);
                          setViewMedia(true);
                        }}
                      />
                    )}
                    <div className={styles.DivIndicatorContainer}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div data-e2e="dm-warning"></div>

          {/* Actions */}
          <div className={styles.DivActions}>
            <div
              role="button"
              tabIndex={0}
              data-area="More"
              aria-expanded="false"
              aria-haspopup="dialog"
              className={styles.DivIconAction}
            >
              <FontAwesomeIcon icon={faEllipsis} />
            </div>
            <div className="TUXTooltip-reference">
              <div
                tabIndex={0}
                role="button"
                data-area="Reply"
                className={styles.DivIconAction}
                onClick={() => setReply(mes)}
              >
                <svg
                  fill="currentColor"
                  fontSize="20px"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                >
                  <path d="m4.59 17.41 13.29 13.3a1 1 0 0 0 1.41 0l1.42-1.42a1 1 0 0 0 0-1.41L10.83 18H22.8c3.4 0 5.82 0 7.72.16 1.88.15 3.07.44 4.02.93a10 10 0 0 1 4.37 4.37c.49.95.78 2.14.93 4.02.16 1.9.16 4.33.16 7.72V43a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7.89c0-3.28 0-5.87-.17-7.95a14.4 14.4 0 0 0-1.36-5.52 14 14 0 0 0-6.11-6.11 14.4 14.4 0 0 0-5.52-1.36C28.76 14 26.17 14 22.9 14H10.83l9.88-9.88a1 1 0 0 0 0-1.41l-1.42-1.42a1 1 0 0 0-1.41 0L4.58 14.6a2 2 0 0 0 0 2.82Z"></path>
                </svg>
              </div>
            </div>
            <div
              tabIndex={0}
              role="button"
              data-area="Reaction"
              aria-expanded="false"
              aria-haspopup="dialog"
              className={styles.DivIconAction}
            >
              <ReactionIcon />
              <ReactionPicker
                onClickEmoji={(emoji) => handleReaction(mes, emoji)}
              />
            </div>
          </div>
        </div>
        {mes.reactions?.length > 0 && (
          <div
            tabIndex={0}
            aria-expanded="false"
            aria-haspopup="dialog"
            className={styles.DivReactionContainer}
          >
            {mes?.reactions.map((react, i) => (
              <span key={i} className={styles.ReactionItem}>
                <span className={styles.SpanReactionEmoji}>{react.emoji}</span>
                <span className={styles.SpanReactionEmoji}>
                  {react.quantity}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DirectMessages() {
  const [searchParams, setSearchParams] = useSearchParams();
  // const chatMainRef = useRef(null); // Không cần thiết khi dùng scrollableTarget
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const selectedConversation = useSelector(
    (state) => state.conversation.selectedConversation
  );
  const conversations = useSelector(
    (state) => state.conversation.conversations
  );
  // const pendingConversations = useSelector( // Biến này không được sử dụng
  //   (state) => state.conversation.pendingConversations
  // );

  const [acceptMessages, setAcceptMessages] = useState(
    selectedConversation?.status === 'accepted'
  );

  useEffect(() => {
    setAcceptMessages(selectedConversation?.status === 'accepted');
  }, [selectedConversation?.status]);

  // +++ LOGIC CUỘN VÔ HẠN +++
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const cursorRef = useRef(null); // Dùng ref để lưu cursor (ID tin nhắn cũ nhất)
  const LIMIT = 15; // Tải 15 tin nhắn mỗi lần

  // Hàm tải tin nhắn CŨ HƠN (khi cuộn lên)
  const fetchOlderMessages = async () => {
    if (isLoading || !selectedConversation?.id) return;

    setIsLoading(true);

    try {
      const res = await messageService.getMessagesByConversationId(
        selectedConversation.id,
        cursorRef.current, // Lấy ID tin nhắn cũ nhất hiện tại
        LIMIT
      );
      const olderMessages = res.data;

      if (olderMessages.length > 0) {
        // Thêm tin nhắn CŨ vào *cuối* mảng
        // (Trong layout column-reverse, nó sẽ hiện ở *trên cùng*)
        setMessages((prev) => [...prev, ...olderMessages]);
        // Cập nhật cursor_ref là ID của tin nhắn cũ nhất
        cursorRef.current = olderMessages[olderMessages.length - 1].id;
      }

      // Nếu API trả về ít hơn LIMIT, tức là đã hết
      if (olderMessages.length < LIMIT) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Lỗi khi fetch messages:', err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm tải tin nhắn LẦN ĐẦU (khi chọn conversation)
  const fetchInitialMessages = async (conversationId) => {
    setIsLoading(true);
    setMessages([]); // Xóa tin nhắn cũ
    setHasMore(true); // Reset
    cursorRef.current = null; // Reset

    try {
      const res = await messageService.getMessagesByConversationId(
        conversationId,
        null,
        LIMIT
      );
      const initialMessages = res.data || []; // Đảm bảo là mảng

      // Gán isOwnMessage cho tin nhắn tải lần đầu
      const processedMessages = initialMessages.map((mes) => ({
        ...mes,
        isOwnMessage: mes.author?.id === currentUser?.id,
      }));
      setMessages(processedMessages);

      if (processedMessages.length > 0) {
        cursorRef.current = processedMessages[processedMessages.length - 1].id;
      }
      if (processedMessages.length < LIMIT) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Lỗi khi fetch initial messages:', err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để lấy conversation ID từ URL hoặc khi selectedConversation thay đổi
  useEffect(() => {
    const conversationId = searchParams.get('conversation');

    const loadConversation = async (id) => {
      // Nếu conversation hiện tại không phải là conversation trong URL
      if (selectedConversation?.id !== id) {
        // Reset
        setMessages([]);
        setHasMore(true);
        cursorRef.current = null;

        // Fetch conversation mới
        const res = await conversationService.getConversationById(id);
        dispatch(setSelectedConversation(res));
        // Tải tin nhắn lần đầu *ngay sau khi* có conversation
        await fetchInitialMessages(id);
      }
    };

    if (conversationId) {
      loadConversation(conversationId);
    }

    // Tắt eslint warning vì fetchInitialMessages không cần là dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchParams, currentUser?.id]); // Chỉ chạy khi URL thay đổi

  // useEffect này để xử lý khi click vào 1 conversation (selectedConversation thay đổi)
  useEffect(() => {
    if (selectedConversation?.id) {
      // Kiểm tra xem tin nhắn đã được tải cho conversation này chưa
      // (Tránh tải lại khi `selectedConversation` được update từ socket)
      if (
        messages.length === 0 ||
        messages[0]?.conversationId !== selectedConversation.id
      ) {
        fetchInitialMessages(selectedConversation.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id, currentUser?.id]); // Chỉ chạy khi selectedConversation thay đổi

  //Emoji
  const [openEmoji, setOpenEmoji] = useState(false);
  const buttonEmojiRef = useRef();
  const emojiPanelRef = useRef();
  const emojiInsertRef = useRef();
  useClickOutside([emojiPanelRef, buttonEmojiRef], () => {
    setOpenEmoji(false);
  });

  const handleReaction = (mes, emoji) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== mes.id) return m;

        const reactions = m.reactions || [];
        const existing = reactions.find((r) => r.emoji === emoji);

        if (existing) {
          return {
            ...m,
            reactions: reactions?.map((r) =>
              r.emoji === emoji ? { ...r, quantity: r.quantity + 1 } : r
            ),
          };
        } else {
          return {
            ...m,
            reactions: [...reactions, { emoji, quantity: 1 }],
          };
        }
      })
    );
  };

  // +++ LOGIC SOCKET +++
  useEffect(() => {
    if (!conversations.length || !currentUser?.username) return;
    const pusher = socketClient;
    const channels = [];

    conversations.forEach((conversation) => {
      const channel = pusher.subscribe(`conversation-${conversation.id}`);
      channels.push(channel);

      channel.bind('new-message', async (newMessage) => {
        const isOwn = newMessage.author.username === currentUser.username;
        newMessage.isOwnMessage = isOwn;

        // Chỉ thêm vào state nếu nó là của conversation đang mở
        if (selectedConversation?.id === conversation.id) {
          // Thêm tin nhắn MỚI vào *đầu* mảng
          // (Trong layout column-reverse, nó sẽ hiện ở *dưới cùng*)

          // Logic của bạn: chỉ thêm text của chính mình, hoặc mọi thứ của người khác
          if ((newMessage.type === 'text' && isOwn) || !isOwn) {
            setMessages((prev) => [newMessage, ...prev]);
          } else if (newMessage.type !== 'text' && isOwn) {
            // Xử lý media của chính mình:
            // Tìm tin nhắn "optimistic" (có content là blob:) và thay thế nó
            setMessages((prev) =>
              prev.map((m) =>
                m.content.startsWith('blob:') && m.type === newMessage.type
                  ? newMessage // Thay thế tin nhắn blob bằng tin nhắn thật từ server
                  : m
              )
            );
          }
        }
      });
    });

    return () => {
      channels.forEach((channel) => {
        channel.unbind_all();
        pusher.unsubscribe(channel.name);
      });
    };
  }, [conversations, selectedConversation?.id, currentUser?.username]);

  const [reply, setReply] = useState(null);
  const [viewMedia, setViewMedia] = useState(false);
  const [media, setMedia] = useState(null);
  const [imagesToDisplay, setImagesToDisplay] = useState([]);
  const [videosToDisplay, setVideosToDisplay] = useState([]);
  const [message, setMessage] = useState('');
  const [submitTick, setSubmitTick] = useState(0);

  const handleSend = async ({ text, images }) => {
    if (
      !text &&
      !imagesToDisplay.length &&
      !videosToDisplay.length &&
      !images?.length
    )
      return;

    if (text) {
      const newMesText = {
        content: text,
        type: 'text',
        parentId: reply?.id || null,
      };
      // Gửi API. Socket sẽ lắng nghe và tự thêm vào state.
      await messageService.createMessage(selectedConversation?.id, newMesText);
    }

    const allImages = [...imagesToDisplay, ...(images || [])];
    allImages.forEach(async (img) => {
      // Optimistic UI: Thêm tin nhắn (ảnh blob) vào state *ngay lập tức*
      const optimisticMes = {
        id: Date.now() + Math.random(),
        content: img, // Đây là một blob: URL
        type: 'image',
        isOwnMessage: true,
        author: currentUser,
        replyTo: reply,
        createdAt: new Date(),
        conversationId: selectedConversation.id, // Thêm để so sánh
      };
      setMessages((prev) => [optimisticMes, ...prev]);

      const file = await anyUrlToFile(
        img,
        `${currentUser.id}-${new Date().toISOString()}`
      );
      const { url } = await mediaService.uploadSingleFile({
        message: file,
        folder: `conversation/${selectedConversation?.id}`,
      });

      // Gửi tin nhắn thật (ảnh cloudinary) lên server
      // Socket sẽ nhận và thay thế tin nhắn optimistic ở trên
      await messageService.createMessage(selectedConversation?.id, {
        parentId: reply?.id || null,
        content: url,
        type: 'image',
      });
    });

    // Tương tự cho video
    videosToDisplay.forEach(async (vid) => {
      const optimisticMes = {
        id: Date.now() + Math.random(),
        content: vid, // Đây là một blob: URL
        type: 'video',
        isOwnMessage: true,
        author: currentUser,
        createdAt: new Date(),
        replyTo: reply,
        conversationId: selectedConversation.id,
      };
      setMessages((prev) => [optimisticMes, ...prev]);

      const file = await anyUrlToFile(
        vid,
        `${currentUser.id}-${new Date().toISOString()}`
      );
      const { url } = await mediaService.uploadSingleFile({
        message: file,
        folder: `conversation/${selectedConversation?.id}`,
      });
      await messageService.createMessage(selectedConversation?.id, {
        parentId: reply?.id || null,
        content: url,
        type: 'video',
      });
    });

    // Reset input
    setMessage('');
    setImagesToDisplay([]);
    setVideosToDisplay([]);
    setReply(null);
  };

  const handleTyping = (text) => setMessage(text);

  const handleImagePaste = (files) => {
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImagesToDisplay((prev) => [...prev, ...newImages]);
  };

  const handleMediaUpload = (e) => {
    const file = e.currentTarget.files[0];
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      setImagesToDisplay((prev) => [...prev, fileURL]);
    } else if (file.type.startsWith('video/')) {
      setVideosToDisplay((prev) => [...prev, fileURL]);
    } else {
      console.warn('File không phải ảnh hoặc video');
    }
    e.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    setImagesToDisplay((prevImages) => {
      const imageToRemove = prevImages[indexToRemove];
      URL.revokeObjectURL(imageToRemove);
      return prevImages.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleRemoveVideo = (indexToRemove) => {
    setVideosToDisplay((prevVideos) => {
      const videoToRemove = prevVideos[indexToRemove];
      URL.revokeObjectURL(videoToRemove);
      return prevVideos.filter((_, index) => index !== indexToRemove);
    });
  };

  return (
    <div id="main-content-messages" className={styles.DivFullSideNavLayout}>
      {selectedConversation ? (
        <div className={styles.DivChatBox}>
          {/* Header */}
          <div className={styles.DivChatHeader}>
            <div
              tabIndex={0}
              role="link"
              aria-label={`${selectedConversation.name}’s profile`}
              className={styles.DivChatHeaderContentWrapper}
            >
              <Link
                target="_blank"
                rel="opener"
                tabIndex={-1}
                aria-label={`${selectedConversation.name}’s profile`}
                className={styles.StyledLink}
                to={`/@${selectedConversation.username}`}
              >
                <span
                  shape="circle"
                  data-e2e="top-chat-avatar"
                  className={styles.SpanAvatarContainer}
                  style={{ width: '48px', height: '48px' }}
                >
                  <img
                    loading="lazy"
                    alt=""
                    src={selectedConversation.avatar}
                    className={styles.ImgAvatar}
                  />
                </span>
              </Link>
              <Link
                target="_blank"
                rel="opener"
                tabIndex={-1}
                aria-label={`${selectedConversation.name}’s profile`}
                className={styles.StyledLink}
                to={`/@${selectedConversation.username}`}
              >
                <div className={styles.DivNameContainer}>
                  <p data-e2e="chat-nickname" className={styles.PNickname}>
                    {selectedConversation.name}
                  </p>
                  <p data-e2e="chat-uniqueid" className={styles.PUniqueId}>
                    {`@${selectedConversation.username}`}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Main Chat (Đã thay đổi) */}
          <div
            className={styles.DivChatMain}
            id="scrollableDiv" // ID này rất quan trọng
            style={{
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column-reverse', // Chìa khóa!!
            }}
          >
            <InfiniteScroll
              dataLength={messages.length} // Số tin nhắn hiện có
              next={fetchOlderMessages} // Hàm để tải tin nhắn cũ
              style={{ display: 'flex', flexDirection: 'column-reverse' }} // Bắt buộc
              inverse={true} // Bắt buộc: bật chế độ đảo ngược
              hasMore={hasMore} // State cho biết còn tin nhắn cũ để tải không
              loader={
                <h4 style={{ textAlign: 'center', color: 'white' }}>
                  Đang tải...
                </h4>
              }
              scrollableTarget="scrollableDiv" // ID của div cha
            >
              {/* Render danh sách tin nhắn */}
              {messages.map((mes, i) => (
                <MessageItem
                  key={mes.id || i}
                  mes={mes}
                  i={i}
                  currentUser={currentUser}
                  handleReaction={handleReaction}
                  setReply={setReply}
                  setViewMedia={setViewMedia}
                  setMedia={setMedia}
                />
              ))}
            </InfiniteScroll>
          </div>

          {/* Bottom */}
          {acceptMessages && (
            <div className={styles.DivChatBottom}>
              <div
                data-focus-guard="true"
                tabIndex={-1}
                style={{
                  width: '1px',
                  height: 0,
                  padding: 0,
                  overflow: 'hidden',
                  position: 'fixed',
                  top: '1px',
                  left: '1px',
                }}
              />
              {(imagesToDisplay.length > 0 || videosToDisplay.length > 0) && (
                <div className={styles.MediaPreviewContainer}>
                  {imagesToDisplay.map((src, index) => (
                    <span key={index} className={styles.MediaWrapper}>
                      <img
                        src={src}
                        alt="Pasted Image"
                        className={styles.MediaPreview}
                      />
                      <FontAwesomeIcon
                        icon={faClose}
                        className={styles.CloseImage}
                        onClick={() => handleRemoveImage(index)}
                      />
                    </span>
                  ))}
                  {videosToDisplay.map((src, index) => (
                    <span key={index} className={styles.MediaWrapper}>
                      <video
                        src={src}
                        controls
                        className={styles.MediaPreview}
                      />
                      <FontAwesomeIcon
                        icon={faClose}
                        className={styles.CloseImage}
                        onClick={() => handleRemoveVideo(index)}
                      />
                    </span>
                  ))}
                </div>
              )}
              <div data-focus-lock-disabled="disabled" />
              <div
                data-focus-guard="true"
                tabIndex={-1}
                style={{
                  width: '1px',
                  height: 0,
                  padding: 0,
                  overflow: 'hidden',
                  position: 'fixed',
                  top: '1px',
                  left: '1px',
                }}
              />
              {/* Trả lời tin nhắn */}
              {reply && (
                <div className={styles.DivRefMessage}>
                  <div className={styles.DivChatBottomRefMessageContent}>
                    <div
                      className={styles.DivMaxTwoLine}
                    >{`${reply.author.name}: ${reply.content}`}</div>
                  </div>
                  <div
                    tabIndex={0}
                    role="button"
                    className={styles.SpanRefMessageExit}
                    onClick={() => setReply(null)}
                  >
                    <svg
                      fill="currentColor"
                      fontSize="16px"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                    >
                      <path d="M38.7 12.12a1 1 0 0 0 0-1.41l-1.4-1.42a1 1 0 0 0-1.42 0L24 21.17 12.12 9.3a1 1 0 0 0-1.41 0l-1.42 1.42a1 1 0 0 0 0 1.41L21.17 24 9.3 35.88a1 1 0 0 0 0 1.41l1.42 1.42a1 1 0 0 0 1.41 0L24 26.83 35.88 38.7a1 1 0 0 0 1.41 0l1.42-1.42a1 1 0 0 0 0-1.41L26.83 24 38.7 12.12Z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className={styles.DivMessageInputAndSendButton}>
                <div
                  data-e2e="message-input-area"
                  className={styles.DivInputAreaContainer}
                >
                  <div className={styles.DivEditorContainer}>
                    <div className={styles.DivInputAreaContainerInner}>
                      <div className={styles.DivOutlineReceiver}></div>
                      <ChatInput
                        value={message}
                        placeholder="Gửi tin nhắn..."
                        onSubmit={handleSend}
                        onChange={handleTyping}
                        onPasteImages={handleImagePaste}
                        submitSignal={submitTick}
                        submitEvenIfEmpty={true}
                        onInsertEmojiRef={emojiInsertRef}
                      />
                    </div>
                  </div>
                  {/* Image button */}
                  <div
                    className="TUXTooltip-reference"
                    style={{ marginBottom: '20px' }}
                  >
                    <div
                      tabIndex="0"
                      role="button"
                      className={styles.DivImageButton}
                    >
                      <div
                        aria-haspopup="true"
                        aria-controls="image-selection-container"
                      >
                        <label
                          htmlFor="file-input-select-image"
                          className={styles.LabelMediaButton}
                        >
                          <FontAwesomeIcon
                            icon={faImage}
                            style={{ width: '24px', height: '24px' }}
                          />
                        </label>
                        <input
                          id="file-input-select-image"
                          type="file"
                          multiple=""
                          accept="image/jpeg,image/jpg,image/png,video/mp4"
                          className={styles.InputMediaButton}
                          onChange={(e) => handleMediaUpload(e)}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    ref={buttonEmojiRef}
                    className="TUXTooltip-reference"
                    style={{ marginBottom: '20px' }}
                    onClick={() => setOpenEmoji((prev) => !prev)}
                  >
                    <div
                      tabIndex={1}
                      role="button"
                      aria-expanded="false"
                      aria-haspopup="true"
                      aria-controls="emoji-suggestion-container"
                      className={styles.DivEmojiButton}
                    >
                      <svg
                        className={styles.StyledEmojiIcon}
                        width="1em"
                        height="1em"
                        viewBox="0 0 48 48"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6ZM2 24C2 11.8497 11.8497 2 24 2C36.1503 2 46 11.8497 46 24C46 36.1503 36.1503 46 24 46C11.8497 46 2 36.1503 2 24Z"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M17 23C18.6569 23 20 21.2091 20 19C20 16.7909 18.6569 15 17 15C15.3431 15 14 16.7909 14 19C14 21.2091 15.3431 23 17 23Z"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M31 23C32.6569 23 34 21.2091 34 19C34 16.7909 32.6569 15 31 15C29.3431 15 28 16.7909 28 19C28 21.2091 29.3431 23 31 23Z"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M16 28.3431C16 31.4673 19.5817 36 24 36C28.4183 36 32 31.4673 32 28.3431C32 25.219 16 25.219 16 28.3431Z"
                        />
                      </svg>
                    </div>
                  </div>
                  {openEmoji && (
                    <EmojiPanel
                      panelRef={emojiPanelRef}
                      handleClickEmoji={(emoji) =>
                        emojiInsertRef.current?.(emoji)
                      }
                    />
                  )}
                </div>
                {(message ||
                  imagesToDisplay.length > 0 ||
                  videosToDisplay.length > 0) && (
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className={styles.StyledSendButton}
                    onClick={() => setSubmitTick((t) => t + 1)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Stranger Box */}
          {!acceptMessages && (
            <div className={styles.DivStrangerBox}>
              <div className={styles.DivHint}>
                <p className={styles.PStrangerTitle}>
                  {`${selectedConversation.name} muốn gửi cho bạn tin nhắn`}
                </p>
                <p className={styles.PStrangerDesc}>
                  Nếu bạn chấp nhận, bạn có thể trò chuyện với người dùng này
                  ngay lập tức. Nếu bạn xóa, cuộc trò chuyện này sẽ bị xóa khỏi
                  danh sách yêu cầu tin nhắn của bạn. Lưu ý rằng người dùng này
                  có thể gửi tối đa 3 tin nhắn.{' '}
                  <span className={styles.SpanReportText}>
                    Hãy báo cáo người dùng này
                  </span>{' '}
                  nếu bạn nhận được tin nhắn đáng ngờ.
                </p>
              </div>
              <div className={styles.DivOperation}>
                <div
                  role="button"
                  tabIndex={0}
                  className={styles.DivItem}
                  onClick={async () => {
                    setAcceptMessages(false);
                    await conversationService.setStatus(
                      selectedConversation?.id,
                      'blocked'
                    );
                  }}
                >
                  Delete
                </div>
                <div className={styles.DivSplit}></div>
                <div
                  role="button"
                  tabIndex={0}
                  className={styles.DivItem}
                  onClick={async () => {
                    setAcceptMessages(true);
                    await conversationService.setStatus(
                      selectedConversation?.id,
                      'accepted'
                    );
                  }}
                >
                  Accept
                </div>
              </div>
            </div>
          )}
          {viewMedia && (
            <ModalProvider isActive={viewMedia} setActive={setViewMedia}>
              <MediaModal media={media} onClose={() => setViewMedia(false)} />
            </ModalProvider>
          )}
        </div>
      ) : (
        <div className={styles.DivChatBox}>
          <div className={styles.DivIconContainer}>
            <svg
              fill="currentColor"
              color="var(--ui-shape-neutral-3)"
              fontSize="92"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
            >
              <path d="M28 34h-4c-7.68 0-12.04-1.83-14.48-4.07C7.14 27.74 6 24.58 6 20.5 6 13.85 13.16 7 24 7s18 6.85 18 13.5c0 4.46-1.93 8.49-5.3 12.23a45.03 45.03 0 0 1-8.7 7.23V34Zm0 10.7c9.52-5.82 18-13.66 18-24.2C46 10.84 36.15 3 24 3S2 10.84 2 20.5 7.5 38 24 38v7.32a.99.99 0 0 0 1.47.86A93.58 93.58 0 0 0 28 44.7Z"></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
