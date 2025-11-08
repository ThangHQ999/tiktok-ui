import clsx from 'clsx';

import styles from './styles.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import debounce from '../../utils/debounce';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faChevronDown,
  faCircleXmark,
  faClock,
  faEllipsis,
  faSearch,
  faUpLong,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import Text from '../Text';
import searchService from '../../services/search/search.service';
import MorePopover from '../MorePopover/MorePopover';
import { useDrawerStore } from '../../store/drawerStore';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

function SearchDrawer() {
  const { t } = useTranslation('search');
  const currentUser = useSelector((state) => state.auth.currentUser);
  const { closeDrawer } = useDrawerStore();
  const navigate = useNavigate();
  const buttonMoreRefs = useRef([]);
  const popoverMoreRefs = useRef([]);
  const [showAction, setShowAction] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearch, setRecentSearch] = useState([]);
  const [guessSearch, setGuessSearch] = useState([]);
  const [seeMore, setSeeMore] = useState(false);

  const fetchSuggestions = async (query) => {
    try {
      const data = await searchService.suggestion(query);
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      const fetchHistorySearch = async () => {
        const res = await searchService.history();
        setRecentSearch(res);
      };
      fetchHistorySearch();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    setSearch(searchQuery);
  }, [searchParams]);

  const debouncedFetchSuggestions = useCallback(
    debounce(async (value) => {
      if (value) fetchSuggestions(value);
    }, 800),
    []
  );

  const handleChangeInput = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedFetchSuggestions(value);
  };

  const handleResetSearchForm = () => {
    setSearch('');
    setSuggestions([]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    closeDrawer('search');
    if (search) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
      await searchService.createSearch(search);
    }
  };

  return (
    <div className={styles.DivSearchContainer}>
      <div className={styles.DivSearchDriverHeader}>
        <Text
          as="h2"
          display
          weight="bold"
          style={{ letterSpacing: '0.3px', color: 'inherit', fontSize: 20 }}
        >
          {t('search')}
        </Text>
      </div>

      <div className={styles.DivSearchFormContainer}>
        <form
          data-e2e="search-box"
          className={clsx('search-input', styles.FormElement)}
          action="/search"
          onSubmit={(e) => handleSearch(e)}
        >
          <h1 style={{ display: 'none', alignItems: 'center' }}>{search}</h1>
          <input
            placeholder="Search"
            name="q"
            type="text"
            autoComplete="off"
            role="combobox"
            aria-controls=""
            aria-label="Search"
            aria-expanded="false"
            aria-autocomplete="list"
            data-e2e="search-user-input"
            className={styles.InputElement}
            value={search}
            onChange={(e) => handleChangeInput(e)}
          />
          <div
            data-e2e="reset-search-form"
            className={styles.DivIconWrapper}
            onClick={handleResetSearchForm}
          >
            <FontAwesomeIcon
              icon={faCircleXmark}
              style={{
                margin: '0 12px',
                width: '16px',
                height: '16px',
                color: 'rgba(255, 255, 255, 0.34)',
              }}
            />
          </div>
          <div className={styles.DivInputBorder}></div>
        </form>

        <ul
          id="header-sug-results"
          role="listbox"
          aria-label="Search suggestions"
          data-e2e="sug-container"
          className={styles.UlContainer}
        >
          {!search && recentSearch.length > 0 && (
            <div
              data-e2e="search-transfer-history-title"
              className={styles.DivHeader}
            >
              {t('recentSearches')}
            </div>
          )}
          {/* Mỗi <li> bên dưới nên render từ mảng data searchResult */}
          {search &&
            suggestions.map((text, idx) => (
              <li
                id={`sug-list-item-${idx}`}
                data-e2e="content-sug-item"
                role="option"
                className={styles.LiItemContainer}
                key={idx}
                onClick={() => {
                  setSearch(text);
                  navigate(`/search?q=${encodeURIComponent(text)}`);
                }}
              >
                <div className={styles.DivSearchIconContainer}>
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{ width: '1rem', height: '1rem' }}
                  />
                </div>
                <div className={styles.DivSugItemContent}>
                  <div className={styles.DivSugItemWrapper}>
                    <h4 className={styles.H4ItemTitle}>{text}</h4>
                    <div className={styles.DivActionContainer}>
                      <div
                        aria-label="more"
                        role="button"
                        tabIndex={0}
                        className={styles.DivMoreContainer}
                        ref={(el) => (buttonMoreRefs.current[idx] = el)}
                        onMouseEnter={() => setShowAction(true)}
                      >
                        <FontAwesomeIcon
                          icon={faEllipsis}
                          className={styles.StyledMoreIcon}
                        />

                        {buttonMoreRefs.current[idx] && showAction && (
                          <MorePopover
                            triggerElement={buttonMoreRefs.current[idx]}
                            ref={(el) => (popoverMoreRefs.current[idx] = el)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          {!search &&
            (seeMore ? recentSearch : recentSearch.slice(0, 5)).map((r) => (
              <li
                key={r.id}
                id={`sug-list-item-${r.id}`}
                data-e2e="content-sug-item"
                role="option"
                className={styles.LiItemContainer}
              >
                <FontAwesomeIcon
                  icon={faClock}
                  className={styles.StyledClockFillDark}
                  style={{ width: '1rem', height: '1rem' }}
                />
                <h4
                  className={styles.H4ItemText}
                  onClick={(e) => {
                    handleSearch(e);
                    navigate(`/search?q=${encodeURIComponent(r.keyword)}`);
                  }}
                >
                  {r.keyword}
                </h4>
                <FontAwesomeIcon
                  icon={faXmark}
                  className={styles.StyledXMarkDark}
                  style={{ width: '1rem', height: '1rem' }}
                  onClick={async () => {
                    try {
                      await searchService.deleteSearch(r.id);
                      setRecentSearch((prev) =>
                        prev.filter((s) => s.id !== r.id)
                      );
                    } catch (err) {
                      return err;
                    }
                  }}
                />
              </li>
            ))}
          {!search && recentSearch.length > 5 && (
            <div
              data-e2e="search-transfer-history-see-more"
              className={styles.DivFooter}
              onClick={async () => {
                if (!seeMore) {
                  setSeeMore(true);
                } else {
                  setRecentSearch([]);
                  await searchService.clearAll();
                  setSeeMore(false);
                }
              }}
            >
              <div className={styles.DivFooterText}>
                {!seeMore ? 'See more' : 'Clear All'}
              </div>
              {!seeMore && (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={styles.StyledChevronDownDark}
                />
              )}
            </div>
          )}
          {!search && guessSearch.length > 0 && (
            <>
              <div
                data-e2e="search-transfer-guess-search-title"
                className={styles.DivHeader}
              >
                {t('mayLike')}
              </div>
              {guessSearch.map((guess, idx) => (
                <li
                  key={idx}
                  data-e2e="search-transfer-guess-search-item"
                  id="transfer-list-item-0"
                  className={styles.LiItemContainer}
                  onClick={(e) => {
                    handleSearch(e);
                    navigate(`/search?q=${encodeURIComponent(guess.text)}`);
                  }}
                >
                  {guess.type === 'top' && (
                    <FontAwesomeIcon
                      icon={faUpLong}
                      style={{
                        width: '16px',
                        height: '16px',
                        flexShrink: '0',
                        color: '#FF3B5C',
                      }}
                    />
                  )}
                  {guess.type === 'guess' && (
                    <div className={styles.DivMark}>
                      <div className={styles.DivMarkDot}></div>
                    </div>
                  )}
                  {guess.type === 'trending' && (
                    <FontAwesomeIcon
                      icon={faArrowTrendUp}
                      style={{
                        width: '16px',
                        height: '16px',
                        flexShrink: '0',
                        color: '#FF3B5C',
                      }}
                    />
                  )}
                  <h4
                    className={styles.H4ItemText}
                    onClick={() =>
                      navigate(`/search?q=${encodeURIComponent(guess.text)}`)
                    }
                  >
                    {guess.text}
                  </h4>
                </li>
              ))}
            </>
          )}
          {search && (
            <li
              id="sug-list-item-8"
              data-e2e="sug-more"
              role="option"
              className={styles.LiItemContainerMore}
            >
              <p className={styles.PMoreText}>
                {t('viewAllResult')}“{search}”
              </p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default SearchDrawer;
