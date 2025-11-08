import React, { useState, useEffect, useRef } from 'react';
import styles from './MainVideoCard.module.scss';
import clsx from 'clsx';
import Button from '../Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsis,
  faMusic,
  faVolumeHigh,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';

import Text from '../Text';
import MorePopover from '../MorePopover/MorePopover';
import { getMenuItemVideo } from '../../configs/menuItemVideo.jsx';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setMuted, setVolume } from '../../features/volume/volumeSlice';
import usePauseOnTabHidden from '../../hooks/usePauseOnTabHidden';

const MainVideoCard = ({ data, onEnded = () => {} }) => {
  const dispatch = useDispatch();
  const volumeReducer = useSelector((state) => state.volume);
  const autoScrollReducer = useSelector((state) => state.autoScroll);
  const autoScroll = autoScrollReducer.autoScroll;

  const menuItemVideo = getMenuItemVideo();
  const [videoData, setVideoData] = useState(data);
  const [seeMore, setSeeMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  //Đoạn này set View khi cuộn
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isVisible) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isVisible]);

  //Đoạn này để set cho Popover Menu
  const moreButtonRef = useRef(null);
  const popoverMenuRef = useRef(null);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    const progressBar = progressBarRef.current;
    if (progressBar) {
      setProgressBarWidth(progressBar.offsetWidth);
    }
  }, [videoData]);

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
  }, [videoData]);

  //Hàm click vào thanh tiến trình
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

  //Hàm kéo nút tua video
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

  //Sự kiện kéo nút volume
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

  //Set sự kiện cho việc click vào bên ngoài popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popoverMenuRef.current &&
        !popoverMenuRef.current.contains(event.target) &&
        !moreButtonRef.current.contains(event.target)
      ) {
        setShowPopover(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

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

  //Hàm thay đổi volume
  const changeVolume = (e) => {
    const value = parseFloat(e.target.value);
    dispatch(setVolume(value));
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  if (loading) {
    return (
      <section className="css-1p5s595-SectionMediaCardContainer">
        Loading video...
      </section>
    );
  }

  if (error) {
    return (
      <section className="css-1p5s595-SectionMediaCardContainer">
        Error: {error}
      </section>
    );
  }

  if (!videoData) {
    return null;
  }

  return (
    <section
      id="one-column-item-0"
      shape="vertical"
      tabIndex="0"
      role="button"
      aria-label="Watch in full screen"
      data-e2e="feed-video"
      className={clsx(styles.SectionMediaCardContainer, 'e1heooat0')}
    >
      <canvas
        width="56.25"
        height="100"
        className={clsx(styles.CanvasMediaCardPlaceholder, 'e16pyws80')}
      ></canvas>
      <div
        className={clsx(
          styles['BasePlayerContainer-DivVideoPlayerContainer'],
          'e16pyws83'
        )}
      >
        <div
          mode="0"
          className={clsx(styles.DivContainer, 'e1yey0rl0')}
          style={{ borderRadius: '16px' }}
        >
          <div className="css-41hm0z">
            <span
              style={{
                boxSizing: 'border-box',
                display: 'block',
                overflow: 'hidden',
                width: 'initial',
                height: 'initial',
                background: 'none',
                opacity: '1',
                border: '0px',
                margin: '0px',
                padding: '0px',
                position: 'absolute',
                inset: '0px',
              }}
            >
              <picture>
                <img
                  alt={videoData?.tags.map((c) => c).join('')}
                  fetchPriority="auto"
                  decoding="async"
                  src={videoData?.thumbnail}
                  srcSet={videoData?.thumbnail}
                  style={{
                    position: 'absolute',
                    inset: '0px',
                    boxSizing: 'border-box',
                    padding: '0px',
                    border: 'none',
                    margin: 'auto',
                    display: 'block',
                    width: '0px',
                    height: '0px',
                    minWidth: '100%',
                    maxWidth: '100%',
                    minHeight: '100%',
                    maxHeight: '100%',
                  }}
                />
              </picture>
            </span>
          </div>
          <div className={clsx(styles.DivBasicPlayerWrapper, 'e1yey0rl2')}>
            <div
              id={`xgwrapper-0-${videoData.id}`}
              className={clsx(
                'xgplayer-container',
                styles['tiktok-web-player']
              )}
            >
              <video
                ref={videoRef}
                loop={!autoScroll}
                className=""
                onClick={togglePlay}
                onEnded={onEnded}
                muted={isMuted}
                autoPlay
                playsInline
                data-index="-1"
                data-xgplayerid={`11c5990f-28d4-4fbd-a70c-86a8a8308f3f`}
                poster={videoData?.thumbnail}
                preload="auto"
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: '0px',
                  left: '0px',
                }}
              >
                <source
                  className=""
                  src={videoData.content}
                  type="video/mp4"
                  data-index="1"
                />
              </video>
            </div>
          </div>
        </div>
        <div className={clsx(styles.DivMediaCardTop, 'e1yeguby0')}>
          <div className={clsx(styles.DivMediaControlsTop, 'e1yeguby2')}>
            <div className={clsx(styles.DivFlexCenter, 'e1yeguby3')}>
              <div
                className={clsx(styles.DivAudioControlContainer, 'eva82x91')}
              >
                <div
                  data-e2e="video-sound"
                  tabIndex="0"
                  role="button"
                  aria-label="Volume"
                  aria-pressed="false"
                  className={clsx(styles.DivMuteIconContainer, 'eva82x90')}
                >
                  <>
                    <FontAwesomeIcon
                      icon={isMuted ? faVolumeXmark : faVolumeHigh}
                      style={{ width: '24px', height: '24px' }}
                      onClick={toggleMute}
                    />
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
                  </>
                </div>
              </div>
            </div>
            <div className={clsx(styles.DivFlexCenter, 'e1yeguby3')}>
              <div className={'css-1dux0b3'}>
                <Button
                  ref={moreButtonRef}
                  className="css-3ryazn"
                  capsule
                  size="medium"
                  secondary
                  icon={<FontAwesomeIcon icon={faEllipsis} />}
                  onClick={() => {
                    if (moreButtonRef.current) {
                      setShowPopover(!showPopover);
                    }
                  }}
                />
                {showPopover && (
                  <MorePopover
                    isMenu
                    ref={popoverMenuRef}
                    triggerElement={moreButtonRef}
                    list={menuItemVideo}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        {!isDragging && (
          <div className={clsx(styles.DivMediaCardBottom, 'e1qm78nh0')}>
            <div
              className={clsx(styles.DivCaptionContainer, 'e1qm78nh5')}
            ></div>
            <div className={clsx(styles.DivMainInfoContainer, 'e1qm78nh1')}>
              {videoData?.location && (
                <div
                  className={clsx(styles.DivAnchorTagContainer, 'e1qm78nh2')}
                >
                  <div
                    className={clsx(styles.DivAnchorTagWrapper, 'e1sksq2r0')}
                  >
                    <div className={clsx(styles.DivAnchorTag, 'e1sksq2r5')}>
                      <Link
                        rel="opener"
                        target="_self"
                        className={clsx(
                          styles.StyledLink,
                          'e65hkrg0',
                          'link-a11y-focus'
                        )}
                        to={`/place/${videoData?.location}?lang=en`}
                      >
                        <svg
                          fontSize="14px"
                          viewBox="0 0 48 48"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          width="1em"
                          height="1em"
                        >
                          <path
                            d="M0 5a5 5 0 0 1 5-5h38a5 5 0 0 1 5 5v38a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5Z"
                            fill="#00C39B"
                          ></path>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M24 40.5c.88 0 14-11.43 14-19.1 0-7.68-6.27-13.9-14-13.9s-14 6.22-14 13.9c0 7.67 13.13 19.1 14 19.1Zm0-14.76c2.9 0 5.25-2.34 5.25-5.21A5.23 5.23 0 0 0 24 15.32a5.23 5.23 0 0 0-5.25 5.2A5.23 5.23 0 0 0 24 25.75Z"
                            fill="#fff"
                          ></path>
                        </svg>
                        <p className={clsx(styles.PAnchorTagName, 'e1sksq2r4')}>
                          {videoData?.location}
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              <div
                className={clsx(styles.DivAuthorContentWrapper, 'e1qm78nh3')}
              >
                <div className={clsx(styles.DivAuthorContainer, 'e1g2yhv84')}>
                  <Link
                    className={clsx(
                      styles.StyledAuthorAnchor,
                      'e1g2yhv81',
                      'link-a11y-focus'
                    )}
                    to={`/@${videoData.author.username}?lang=en`}
                  >
                    <div
                      data-e2e="video-author-uniqueid"
                      className={clsx(styles.H3AuthorTitle, 'e1g2yhv80')}
                    >
                      {videoData.author.username}
                    </div>
                  </Link>
                </div>
              </div>
              <div className={clsx(styles.DivDescriptionWrapper, 'exnv47g0')}>
                <div
                  className={clsx(styles.DivMultilineTextContainer, 'e1ozkfi0')}
                  style={{ overflowY: seeMore ? 'none' : 'unset' }}
                >
                  <div
                    className={clsx(styles.DivMultilineText, 'e1ozkfi1')}
                    style={{
                      maxHeight: seeMore ? 'unset' : '18px',
                      overflowY: 'hidden',
                    }}
                  >
                    <div
                      data-e2e="video-desc"
                      className={clsx(
                        styles.DivDescriptionContentContainer,
                        'ejg0rhn1'
                      )}
                    >
                      <span
                        data-e2e="new-desc-span"
                        style={{
                          fontWeight: '400',
                        }}
                      >
                        {videoData?.title}{' '}
                      </span>
                      {videoData.tags.map((tag, index) => (
                        <React.Fragment key={tag}>
                          <Link
                            data-e2e="search-common-link"
                            target="_self"
                            rel="opener"
                            className={clsx(
                              styles.StyledCommonLink,
                              'ejg0rhn6',
                              'link-a11y-focus'
                            )}
                            to={`/tag/${tag}?lang=en`}
                          >
                            <strong
                              className={clsx(styles.StrongText, 'ejg0rhn2')}
                            >
                              {`#${tag}`}
                            </strong>
                          </Link>

                          {index < videoData.tags.length - 1 && (
                            <span data-e2e="new-desc-span"> </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    height="18"
                    className={clsx(
                      styles['ButtonExpand-StyledButtonBottom'],
                      'e1ozkfi3'
                    )}
                    onClick={() => setSeeMore(!seeMore)}
                  >
                    {seeMore ? 'less' : 'more'}
                  </button>
                </div>
              </div>
              {data.music && (
                <div
                  className={clsx(
                    styles.DivInlineMusicAndIconContainer,
                    'e1qm78nh6'
                  )}
                >
                  <div
                    className={clsx(styles.DivMusicInfoContainer, 'e1qm78nh4')}
                  >
                    <div
                      data-e2e="video-music"
                      className={clsx(styles.H4Link, 'epjbyn0')}
                    >
                      <Link
                        target="_self"
                        rel="opener"
                        aria-label={`Watch more videos with music nhạc nền - ${data.music.title}`}
                        className={clsx(
                          styles.StyledLink,
                          'media-card-music-info',
                          'epjbyn1',
                          'link-a11y-focus'
                        )}
                        to={`/music/${
                          data.music.author?.name.replaceAll(' ', '-') + '-' ||
                          ''
                        }${data.music.id}`}
                      >
                        <FontAwesomeIcon
                          icon={faMusic}
                          className={styles.MusicNoteIcon}
                        />
                        <div className={clsx(styles.DivMusicText, 'epjbyn3')}>
                          {`${data.music.author?.name || data.music.id}`}
                        </div>
                      </Link>
                    </div>
                  </div>
                  <div
                    className={clsx(styles.DivPlayerControlsRight, 'e16pyws85')}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className={clsx(styles.DivVideoProgressContainer, 'e14k2ouv0')}>
        {isDragging && (
          <Text
            as="p"
            weight={'bold'}
            display
            className="StyledTUXText-StyledTimeDisplayText"
            style={{
              color: 'inherit',
              fontSize: '32px',
              opacity: isDragging ? 1 : 0,
            }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        )}
        <div className={clsx(styles.DivProgressBar, 'e14k2ouv5')}>
          <div
            className={clsx(styles.DivProgressBarScrubHead, styles.e14k2ouv2)}
            style={{
              transform: `translateX(${(progress * progressBarWidth) / 100}px)`,
            }}
            onMouseDown={onMouseDown}
          ></div>
          <div
            ref={progressBarRef}
            className={clsx(styles.DivProgressBarContainer, 'e14k2ouv1')}
            onMouseDown={handleProgressClick}
          >
            <div
              tabIndex="0"
              role="slider"
              aria-label="Video progress"
              aria-valuenow={progress}
              aria-valuetext={`${currentTime.toFixed(1)}s`}
              className={clsx(styles.DivProgressBarElapsed, styles.e14k2ouv3)}
              style={{ width: `${progress}%` }}
            ></div>
            <div
              className={clsx(styles.DivProgressBarBounds, styles.e14k2ouv4)}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainVideoCard;
