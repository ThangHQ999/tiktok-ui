//Logic render Login dựa trên Redux

import { useSelector } from 'react-redux';

import LoginOptionContainer from '../page/Login/LoginOptionContainer';
import LoginEmailForm from '../page/Login/LoginEmailForm';
import LoginPhoneForm from '../page/Login/LoginPhoneForm';
import LoginByQrCode from '../page/Login/LoginByQrCode';
import ResetPasswordByEmail from '../page/Auth/ResetPasswordByEmail';
import ResetPasswordByPhone from '../page/Auth/ResetPasswordByPhone';

function RenderLogin() {
  const component = useSelector((state) => state.auth.component);

  switch (component) {
    case 'optionalLogin':
      return <LoginOptionContainer />;
    case 'emailLogin':
      return <LoginEmailForm />;
    case 'phoneLogin':
      return <LoginPhoneForm />;
    case 'qrLogin':
      return <LoginByQrCode />;
    case 'resetPasswordByPhone':
      return <ResetPasswordByPhone />;
    case 'resetPasswordByEmail':
      return <ResetPasswordByEmail />;
    default:
      return null;
  }
}

export default RenderLogin;
