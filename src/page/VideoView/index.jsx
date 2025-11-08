import clsx from 'clsx';
import styles from './VideoView.module.scss';
import DescriptionVideo from '../../components/DescriptionVideo/DescriptionVideo';
import ActionVideo from '../../components/ActionVideo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faCircleXmark,
  faClose,
  faEllipsis,
  faPlay,
  faSearch,
  faVolumeHigh,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '../../components/Tabs/Tabs';
import VideoSimpleList from '../../components/VideoSimpleList';
import PostComment from '../../components/PostComment';
import FloatingPlayerIcon from '../../components/Icon/FloatingPlayerIcon';
import { useEffect, useRef, useState } from 'react';
import postService from '../../services/post/post.service';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setMuted, setVolume } from '../../features/volume/volumeSlice';
import usePauseOnTabHidden from '../../hooks/usePauseOnTabHidden';
import useScrollVideoNavigation from '../../hooks/useScrollVideoNavigation';
import VideoList from '../../components/VideoList';
import CreatorVideos from './CreatorVideos';

function VideoView({ postId, username }) {
  const dispatch = useDispatch();
  const prevUrl = useSelector((state) => state.listVideo.prevUrl);
  const videos = useSelector((state) => state.listVideo.listVideo);
  const volumeReducer = useSelector((state) => state.volume);
  const autoScrollReducer = useSelector((state) => state.autoScroll);
  const autoScroll = autoScrollReducer.autoScroll;
  const searchContent = 'tôi bị ngu';
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!videos?.length) return;

      try {
        const results = await Promise.all(
          videos.map((v) => postService.getPost(v))
        );
        setPosts(results);

        const index = videos.findIndex((v) => v === Number(postId));
        setCurrentIndex(index !== -1 ? index : 0);
        setCurrentPost(results[index !== -1 ? index : 0]);
      } catch (error) {
        console.error('Lỗi khi fetch posts:', error);
      }
    };

    fetchPosts();
  }, [videos, postId]);

  const changeVideo = (direction) => {
    setCurrentIndex((prev) => {
      let newIndex = prev;

      if (direction === 'next' && prev < posts.length - 1) {
        newIndex = prev + 1;
      } else if (direction === 'prev' && prev > 0) {
        newIndex = prev - 1;
      }

      setCurrentPost(posts[newIndex]);
      return newIndex;
    });
  };

  useEffect(() => {
    if (currentPost?.author.username && currentPost.id)
      navigate(`/@${currentPost.author.username}/video/${currentPost.id}`);
  }, [currentPost, navigate]);

  useScrollVideoNavigation(changeVideo, currentIndex, posts.length);

  // Bấm phím
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleKeyDown = (e) => {
    if (e.code === 'ArrowDown' && currentIndex < posts.length - 1) {
      changeVideo('next');
    } else if (e.code === 'ArrowUp' && currentIndex > 0) {
      changeVideo('prev');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const [search, setSearch] = useState('');
  const videoRef = useRef(null);
  usePauseOnTabHidden(videoRef);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const isMuted = volumeReducer.isMuted;
  const volume = volumeReducer.volume;
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);

  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const volumeSliderRef = useRef(null);

  // Thanh tiến trình video

  const [progressBarWidth, setProgressBarWidth] = useState(0);

  useEffect(() => {
    const progressBar = progressBarRef.current;
    if (progressBar) {
      setProgressBarWidth(progressBar.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      if (total) {
        setProgress((current / total) * 100);
        setCurrentTime(current);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    // Thêm các event listener
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    // Nếu video đã được tải, cập nhật duration
    if (video.readyState >= 1) {
      setDuration(video.duration);
    }

    return () => {
      // Dọn dẹp các event listener
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentPost]);
  //Video Function
  const handleProgressClick = (e) => {
    const progressBar = progressBarRef.current;
    const video = videoRef.current;
    if (!progressBar || !video || !duration) return;

    const newProgressInPixels = e.nativeEvent.offsetX;
    const newProgressPercent =
      (newProgressInPixels / progressBar.offsetWidth) * 100;

    const newTime = (newProgressPercent / 100) * duration;
    video.currentTime = newTime;
    setProgress(newProgressPercent);
  };

  const handleDrag = (clientX) => {
    const progressBar = progressBarRef.current;
    const video = videoRef.current;
    if (!progressBar || !video || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    let newProgressInPixels = clientX - rect.left;
    newProgressInPixels = Math.max(
      0,
      Math.min(newProgressInPixels, rect.width)
    );

    const newProgressPercent = (newProgressInPixels / rect.width) * 100;
    setProgress(newProgressPercent);
    video.currentTime = (newProgressPercent / 100) * duration;
  };

  const onMouseDown = (e) => {
    const video = videoRef.current;
    if (!video) return;
    setIsDragging(true);
    setWasPlaying(!video.paused);
    video.pause();
    handleDrag(e.clientX);
  };

  const onMouseMove = (e) => {
    if (isDragging) {
      handleDrag(e.clientX);
    }
  };

  const onMouseUp = (e) => {
    setIsDragging(false);

    if (videoRef.current && videoRef.current.contains(e.target)) {
      if (wasPlaying) {
        videoRef.current.play();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, wasPlaying]);

  const handleVolumeDrag = (clientX) => {
    const slider = volumeSliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    let newVolume = (clientX - rect.left) / rect.width;
    newVolume = Math.max(0, Math.min(newVolume, 1));

    dispatch(setVolume(newVolume));
  };

  const onVolumeMouseDown = (e) => {
    setIsVolumeDragging(true);
    handleVolumeDrag(e.clientX);
  };

  const onVolumeMouseMove = (e) => {
    if (isVolumeDragging) {
      handleVolumeDrag(e.clientX);
    }
  };

  const onVolumeMouseUp = () => {
    setIsVolumeDragging(false);
  };

  //Gắn sự kiện cho nút volume
  useEffect(() => {
    window.addEventListener('mousemove', onVolumeMouseMove);
    window.addEventListener('mouseup', onVolumeMouseUp);

    return () => {
      window.removeEventListener('mousemove', onVolumeMouseMove);
      window.removeEventListener('mouseup', onVolumeMouseUp);
    };
  }, [isVolumeDragging]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      dispatch(setMuted(false));
    } else {
      dispatch(setMuted(true));
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const changeVolume = (e) => {
    e.stopPropagation();
    const value = parseFloat(e.target.value);
    dispatch(setVolume(value));
  };

  //Search Function
  const handleResetSearchForm = () => {
    setSearch('');
  };
  return (
    <div className={styles.DivBrowserModeContainer} style={{ zIndex: '3000' }}>
      {/* Video */}
      <div className={styles.DivVideoContainer}>
        {/* Search Bar */}
        <div
          className={clsx(styles.DivSearchBarContainer, styles['e11s2kul20'])}
        >
          <div
            className={clsx(
              styles.DivSearchBarBackground,
              styles['e11s2kul25']
            )}
          ></div>
          <div
            className={clsx(styles.DivSearchFormContainer, styles['e1hi1cmj0'])}
          >
            <form
              data-e2e="search-box"
              className={clsx(
                'search-input',
                styles.FormElement,
                styles.e14ntknm0
              )}
              action="/search"
            >
              <h1 style={{ display: 'none', alignItems: 'center' }}>
                {searchContent}
              </h1>
              <input
                placeholder=""
                name="q"
                type="text"
                autoComplete="off"
                role="combobox"
                aria-controls=""
                aria-label=""
                aria-expanded="false"
                aria-autocomplete="list"
                data-e2e="search-user-input"
                className={clsx(styles.InputElement, styles.e14ntknm3)}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
              <div data-e2e="reset-search-form" onClick={handleResetSearchForm}>
                {search && (
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    style={{
                      margin: '0 12px',
                      width: '16px',
                      height: '16px',
                      color: 'rgba(255, 255, 255, 0.34)',
                    }}
                  />
                )}
              </div>
              <span
                className={clsx(styles.SpanSpliter, styles.e14ntknm6)}
              ></span>
              <button
                data-e2e="search-box-button"
                type="submit"
                aria-label="Tìm kiếm"
                className={clsx(styles.ButtonSearch, styles.e14ntknm7)}
              >
                <div
                  className={clsx(
                    styles.DivSearchIconContainer,
                    styles.e14ntknm8
                  )}
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{
                      width: '24px',
                      height: '24px',
                      color: 'rgba(255, 255, 255, 0.75',
                    }}
                  />
                </div>
              </button>
              <div
                className={clsx(
                  styles.DivBrowserModeInputBorder,
                  styles.e14ntknm2
                )}
              ></div>
            </form>
          </div>
        </div>
        {/* Video Wrapper*/}
        <div className={clsx(styles.DivVideoWrapper, styles.e11s2kul3)}>
          <div mode="2" className={clsx(styles.DivContainer, styles.e1yey0rl0)}>
            <div
              data-e2e="browse-video"
              className={clsx(styles.DivBasicPlayerWrapper, styles.e1yey0rl2)}
            >
              <div
                id="xgwrapper-2-7539003870823992584"
                className="xgplayer-container tiktok-web-player"
              >
                <div>
                  <video
                    ref={videoRef}
                    onClick={togglePlay}
                    data-version="0.3.24"
                    preload=""
                    autoPlay
                    loop={!autoScroll}
                    muted={isMuted}
                    style={{
                      width: '100%',
                      height: '100%',
                      verticalAlign: 'middle',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                    src={currentPost?.content}
                  ></video>
                  <div></div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={clsx(styles.DivVideoControlContainer, styles.e135900u5)}
          >
            <div
              ref={progressBarRef}
              className={clsx(styles.DivSeekBarContainer, styles.e1rpry1m0)}
              onMouseDown={handleProgressClick}
            >
              <div
                tabIndex={0}
                role="slider"
                aria-label="progress bar"
                aria-valuenow={
                  currentTime / duration ? (currentTime / duration) * 100 : 0
                }
                aria-valuetext={
                  `${Math.floor(currentTime / 60)
                    .toString()
                    .padStart(2, '0')}:${Math.floor(currentTime % 60)
                    .toString()
                    .padStart(2, '0')}` +
                  `/` +
                  `${Math.floor(duration / 60)
                    .toString()
                    .padStart(2, '0')}:${Math.floor(duration % 60)
                    .toString()
                    .padStart(2, '0')}`
                }
                className={clsx(styles.DivSeekBarProgress, styles.e1rpry1m2)}
              ></div>
              <div
                className={clsx(styles.DivSeekBarCircle, styles.e135900u4)}
                style={{
                  left: `calc(${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%)`,
                }}
                onMouseDown={onMouseDown}
              ></div>
              <div
                className={clsx(styles.DivSeekBar, styles.e135900u3)}
                style={{
                  transform: `scaleX(${
                    currentTime / duration ? currentTime / duration : 0
                  }) translateY(-50%)`,
                }}
              ></div>
            </div>
            <div
              className={clsx(styles.DivSeekBarTimeContainer, styles.e1rpry1m1)}
            >
              {`${Math.floor(currentTime / 60)
                .toString()
                .padStart(2, '0')}:${Math.floor(currentTime % 60)
                .toString()
                .padStart(2, '0')}` +
                `/` +
                `${Math.floor(duration / 60)
                  .toString()
                  .padStart(2, '0')}:${Math.floor(duration % 60)
                  .toString()
                  .padStart(2, '0')}`}
            </div>
          </div>

          <div className={clsx(styles.DivVideoControlTop, styles.e1rpry1m7)}>
            <div
              className={clsx(
                styles.DivVideoClosedCaptionContainer,
                styles.e11s2kul26
              )}
            ></div>
          </div>

          <div
            className={clsx(styles.DivVideoControlBottom, styles.e1rpry1m6)}
          ></div>
        </div>
        {!isPlaying && (
          <FontAwesomeIcon
            icon={faPlay}
            className={styles.StyledPlayIcon}
            style={{ width: '64px', height: '64px' }}
          />
        )}
        {/* Close Button */}
        <button
          role="button"
          aria-label="Đóng"
          data-e2e="browse-close"
          className={clsx(
            styles['ButtonBasicButtonContainer-StyledCloseIconContainer'],
            styles.e11s2kul6
          )}
          onClick={() => navigate(prevUrl)}
        >
          <FontAwesomeIcon
            icon={faClose}
            style={{ width: '18px', height: '18px', fontSize: '18px' }}
          />
        </button>
        {/* Voice Control*/}
        <div
          className={clsx(styles.DivVoiceControlContainer, styles.e11s2kul17)}
        >
          <button
            tabIndex="0"
            role="button"
            aria-label="Volume"
            data-e2e="browse-sound"
            className={clsx(styles.ButtonVoiceControlNew, styles.e11s2kul16)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              fontSize: '20px',
            }}
          >
            <FontAwesomeIcon
              icon={isMuted ? faVolumeXmark : faVolumeHigh}
              onClick={toggleMute}
            />
          </button>
          <div className={styles.volumeSlider}>
            <input
              ref={volumeSliderRef}
              style={{
                width: '70px',
                '--progressVolume': `${isMuted ? 0 : volume * 100}%`,
              }}
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={changeVolume}
              onMouseDown={onVolumeMouseDown}
            />
          </div>
        </div>
        {/*  */}
        {currentIndex > 0 && (
          <button
            data-e2e="arrow-left"
            role="button"
            aria-label="Go to previous video"
            className={clsx(
              styles['ButtonBasicButtonContainer-StyledVideoSwitchUp'],
              styles.e11s2kul10
            )}
            onClick={() => changeVideo('prev')}
          >
            <FontAwesomeIcon
              icon={faChevronUp}
              style={{ width: '26px', height: '26px', fontSize: '26px' }}
            />
          </button>
        )}
        {currentIndex < posts.length - 1 && (
          <button
            data-e2e="arrow-left"
            role="button"
            aria-label="Go to next video"
            className={clsx(
              styles['ButtonBasicButtonContainer-StyledVideoSwitchDown'],
              styles.e11s2kul10
            )}
            onClick={() => changeVideo('next')}
          >
            <FontAwesomeIcon
              icon={faChevronDown}
              style={{ width: '26px', height: '26px', fontSize: '26px' }}
            />
          </button>
        )}
        {/* Floating */}
        <div className={clsx(styles.DivMiniPlayerContainer, styles.e11s2kul19)}>
          <div
            className={clsx(
              styles.DivMiniPlayerButtonContainer,
              styles.e1vz198y0
            )}
            style={{ fontSize: '20px' }}
          >
            <FloatingPlayerIcon />
          </div>
        </div>
        {/* Action */}
        <div className={clsx(styles.DivIconWrapper, styles.e11s2kul14)}>
          <FontAwesomeIcon icon={faEllipsis} />
        </div>
        <div className={clsx(styles.FooterBtnWrapper, styles.e11s2kul23)}></div>
      </div>
      {/* Video Info */}
      <div className={styles.DivContentContainer}>
        <div className={styles.DivCommentContainer}>
          <div className={styles.DivCommentListContainer}>
            <div className={styles.DivProfileWrapper}>
              <DescriptionVideo data={currentPost} />
              <ActionVideo data={currentPost} />
            </div>

            {/* Tab */}
            <Tabs defaultValue={'comments'}>
              <div className={styles.DivTabMenuWrapper}>
                <TabList>
                  <div className={styles.DivTabMenuContainer}>
                    <Tab value={'comments'}>
                      <div className={styles.DivTabItemContainer}>
                        <div className={styles.DivTabItem}>Comments (173)</div>
                      </div>
                    </Tab>
                    <Tab value={'creatorVideos'}>
                      <div className={styles.DivTabItemContainer}>
                        <div className={styles.DivTabItem}>Creator videos</div>
                      </div>
                    </Tab>
                  </div>
                </TabList>
              </div>
              <div className={styles.DivBorder}></div>
              <TabPanels>
                <TabPanel value={'comments'}>
                  {currentPost && <PostComment post={currentPost} />}
                </TabPanel>
                <TabPanel value={'creatorVideos'}>
                  {/* <CreatorVideos username={username} /> */}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoView;
