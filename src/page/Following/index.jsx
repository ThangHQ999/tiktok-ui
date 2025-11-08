import { useEffect, useRef, useState } from 'react';
import UserCard from '../../components/UserCard';
import styles from './styles.module.scss';

import userService from '../../services/user/user.service';
import { useSelector } from 'react-redux';
import Home from '../Home';

function Following() {
  const isAuth = useSelector((state) => state.auth.isAuth);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    const data = await userService.getIntroUsers(1, 10);
    setUsers(data);
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const videoRefs = useRef([]);

  const [activeIndex, setActiveIndex] = useState();

  const handleHover = (index) => {
    videoRefs.current.forEach((v, i) => {
      if (i !== index && v) {
        v.pause();
        v.currentTime = 0;
      }
    });
    videoRefs.current[index]?.play();
    setActiveIndex(index);
  };

  if (isAuth) return <Home value="following" />;

  return (
    <main className={styles.DivMainContainer}>
      <div className={styles.DivUserListWrapper}>
        {users.map((user, i) => {
          if (currentUser?.id === user.id) return null;
          return (
            <UserCard
              key={user.id}
              data={user}
              onHover={() => handleHover(i)}
              setRef={(el) => (videoRefs.current[i] = el)}
              currentIndex={i}
              activeIndex={activeIndex}
            />
          );
        })}
      </div>
      <div className={styles.DivFixedTopContainer}></div>
      <div className={styles.DivFixedBottomContainer}></div>
    </main>
  );
}

export default Following;
