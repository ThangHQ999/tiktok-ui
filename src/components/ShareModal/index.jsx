import Text from '../Text';
import styles from './ShareModal.module.scss';
import './ShareModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faCode, faSearch } from '@fortawesome/free-solid-svg-icons';
import { createPortal } from 'react-dom';
import { FaFacebookF, FaTelegram, FaWhatsapp } from 'react-icons/fa';
import Icon from '../Icon/Icon';
import { useEffect, useRef } from 'react';
import handleCopy from '../../utils/handleCopy';
import {
  shareToFacebook,
  shareToTelegram,
  shareToWhatsApp,
} from '../../utils/shareOption';

export default function ShareModal({
  postId = null,
  authorUserName = null,
  isSharePost = true,
  isOpen = false,
  onClose = () => {},
  shareToFriends = false,
}) {
  const shareOptions = [
    {
      icon: (
        <Icon
          name={'link'}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#348bc5ff',
            color: 'white',
            rotate: '135deg',
            padding: '10px',
          }}
        />
      ),
      name: 'Copy',
      onClick: () => {
        isSharePost ? handleCopy({ postId, authorUserName }) : handleCopy({});
        onClose();
      },
    },
    {
      icon: (
        <Icon
          name="WhatsApp"
          color={'white'}
          style={{
            backgroundColor: 'rgb(37, 211, 102)',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            padding: '10px',
          }}
          size={'64px'}
        />
      ),
      name: 'WhatsApp',
      onClick: () => shareToWhatsApp(),
    },
    {
      icon: (
        <FontAwesomeIcon
          icon={faCode}
          style={{
            fontSize: '32px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgb(0, 186, 208)',
            color: 'white',
            padding: '16px',
          }}
        />
      ),
      name: 'Embed',
      // onClick: () => shareToFacebook(),
    },
    {
      icon: (
        <FaFacebookF
          size={64}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#1877F2',
            color: 'white',
            paddingTop: '12px',
          }}
        />
      ),
      name: 'Facebook',
      onClick: () => shareToFacebook(),
    },
    {
      icon: (
        <FaTelegram
          size={64}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            color: 'rgb(55, 174, 226)',
            backgroundColor: 'white',
          }}
        />
      ),
      name: 'Telegram',
      onClick: () => shareToTelegram(),
    },
  ];
  const shareRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;
  return createPortal(
    <div
      className="TUXModal-overlay"
      data-transition-status="open"
      dir="ltr"
      style={{
        position: 'fixed',
        overflow: 'auto',
        inset: 0,
        zIndex: 3500,
      }}
    >
      <span
        data-type="inside"
        tabIndex="0"
        aria-hidden="true"
        data-floating-ui-focus-guard=""
        data-floating-ui-inert=""
        style={{
          border: '0px',
          clip: 'rect(0px, 0px, 0px, 0px)',
          height: '1px',
          margin: '-1px',
          overflow: 'hidden',
          padding: '0px',
          position: 'fixed',
          whiteSpace: 'nowrap',
          width: '1px',
          top: '0px',
          left: '0px',
        }}
      ></span>
      <div
        ref={shareRef}
        className="TUXModal"
        data-width="small"
        role="dialog"
        style={{ maxWidth: 'unset', width: '30rem', zIndex: 3500 }}
      >
        {/* Header */}
        <div className="TUXModalNavBar">
          <div className="TUXModalNavBar-leading">
            {shareToFriends && (
              <button
                type="button"
                className="TUXNavBarIconButton TUXUnstyledButton"
                style={{ paddingLeft: '10px', paddingRight: '10px' }}
              >
                <FontAwesomeIcon
                  icon={faSearch}
                  style={{ width: '24px', height: '24px' }}
                />
              </button>
            )}
          </div>
          <h2 className="TUXModalNavBar-title">Share to</h2>
          <div className="TUXModalNavBar-trailing">
            <button
              type="button"
              className="TUXUnstyledButton TUXNavBarIconButton"
              aria-label="close"
              onClick={onClose}
            >
              <FontAwesomeIcon
                icon={faClose}
                style={{ width: '24px', height: '24px', color: 'white' }}
              />
            </button>
          </div>
        </div>

        {/* Share options */}
        <div
          className={styles.DivActionGroupContainer}
          style={{ gap: '0.75rem' }}
        >
          {shareToFriends && (
            <>
              <div className={styles['css-nkwb4a']}>
                <div
                  className={styles['css-18yu2gh']}
                  style={{ height: '7.75rem' }}
                >
                  <div
                    style={{
                      width: '112px',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        insetInlineStart: 0,
                        height: '100%',
                        width: '88px',
                        transform: 'translateX(12px)',
                      }}
                    >
                      <div className={styles.DivQuickShareUserItem}>
                        <div
                          data-e2e="share-"
                          className={styles.DivActionContainer}
                        >
                          <div tabIndex={0} className={styles.DivAction}>
                            <div style={{ display: 'flex' }}>
                              <div className={styles['css-1vztbgn']}>
                                <div
                                  data-e2e="share-avatar"
                                  className={styles['css-uwwqev']}
                                >
                                  <img
                                    src="https://p16-common-sign-useastred.tiktokcdn-eu.com/tos-useast2a-avt-0068-giso/7132002602534830107~tplv-tiktokx-cropcenter:720:720.jpeg?dr=14579&refresh_token=d656bc50&x-expires=1756627200&x-signature=bjzEDkvIdpCs9hbccQVb64rbork%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2"
                                    alt=""
                                    width={64}
                                    height={64}
                                    className="TUXBaseAvatar-src"
                                    style={{ width: '64px', height: '64px' }}
                                  />
                                </div>
                              </div>
                            </div>
                            <p
                              className={`${styles['css-1p6jlgy']} TUXText TUXText--tiktok-sans TUXText--align-center e1vx58lt0`}
                              style={{
                                color: 'inherit',
                                fontSize: '12px',
                                letterSpacing: '0.1608px',
                              }}
                            ></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${styles.arrowsContainer} css-15obktd`}
                    style={{ top: '2.75rem' }}
                  />
                </div>
              </div>
              <div
                role="separator"
                className="tux-separator tux-separator-thin--horizontal"
                style={{ backgroundColor: 'var(--ui-shape-neutral-3)' }}
              ></div>{' '}
            </>
          )}
          <div className={styles['css-nkwb4a']}>
            <div
              className={styles['css-18yu2gh']}
              style={{ height: '7.75rem' }}
            >
              <div
                style={{ width: '992px', height: '100%', position: 'relative' }}
              >
                {shareOptions.map((s, i) => (
                  <div
                    key={s.name}
                    style={{
                      position: 'absolute',
                      top: '0px',
                      insetInlineStart: '0px',
                      height: '100%',
                      width: '88px',
                      transform: `translateX(${88 * i + 12}px)`,
                    }}
                    onClick={() => s.onClick && s.onClick()}
                  >
                    <div className={styles.DivActionContainer}>
                      <div className={styles.DivAction}>
                        <div style={{ display: 'flex' }}>{s.icon}</div>
                        <Text className="StyledTUXText" alignCenter>
                          {s.name}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles['css-15obktd']} style={{ top: '2.75rem' }}>
              <div className={styles['css-14gbl02']}></div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
