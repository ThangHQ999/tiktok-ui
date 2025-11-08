import { Link } from 'react-router-dom';
import styles from './AccountBanned.module.scss';

export default function AccountBanned() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Tài khoản của bạn đã bị cấm</h1>
        <p className={styles.desc}>
          Tài khoản của bạn đã bị vô hiệu hóa do vi phạm Chính sách Cộng Đồng.
          Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ để
          được xem xét.
        </p>
        <button className={styles.button}>
          {' '}
          <Link to={'https://www.tiktok.com/support'}>Liên hệ hỗ trợ</Link>
        </button>
      </div>
    </div>
  );
}
