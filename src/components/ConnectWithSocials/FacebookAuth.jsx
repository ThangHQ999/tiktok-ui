import styles from '../../page/Login/LoginOptionContainer/style.module.scss';
import authService from '../../services/auth/auth.service';
import { useFacebookLogin } from '../../hooks/useFacebookLogin';
import { FaFacebookF } from 'react-icons/fa';

function FacebookAuth() {
  const { login } = useFacebookLogin({
    appId: import.meta.env.VITE_FACEBOOK_APP_ID,
    redirectUri: 'http://localhost:3000/api/v1/auth/socials/facebook/callback',
    onSuccess: async ({ accessToken }) => {
      try {
        await authService.social({ code: accessToken }, 'facebook');
      } catch (err) {
        console.error('❌ Login failed:', err);
      }
    },
    onError: () => console.error('Facebook login canceled'),
  });

  return (
    <div>
      <div className={styles.LasTLoginMethodContainer}></div>
      <div className="DivBoxContainer" onClick={login}>
        <div className="DivIconContainer">
          <FaFacebookF
            size={20}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              paddingTop: '5px',
              backgroundColor: '#1877F2',
              color: 'white',
            }}
          />
        </div>
        <div className="DivTextContainer">
          <div style={{ fontSize: '11px' }}>Tiếp tục với Facebook</div>
        </div>
      </div>
    </div>
  );
}

export default FacebookAuth;
