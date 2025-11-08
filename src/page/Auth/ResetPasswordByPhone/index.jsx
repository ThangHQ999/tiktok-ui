import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import styles from './styles.module.scss';
import { useMemo } from 'react';
import Form from '../../../components/Form';
import Input from '../../../components/Input';
import authService from '../../../services/auth/auth.service';
import { getCurrentUser } from '../../../features/auth/authAsync';
import {
  setComponent,
  setRedirectAfterLogin,
} from '../../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '../../../components/Button';
import { areFieldsFilled } from '../../../function/areFieldsFilled';
import { useProtectedButton } from '../../../contexts/ProtectedButtonContext';
import { ResetPasswordByPhoneSchema } from '../../../schema/resetPasswordSchema';
import CodeInput from '../../../components/CodeInput';
import PhoneInput from '../../../components/PhoneInput';

function ResetPasswordByPhone() {
  const dispatch = useDispatch();
  let schema = useMemo(() => ResetPasswordByPhoneSchema, []);
  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  });

  const {
    watch,
    trigger,
    register,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isLoading },
  } = methods;
  const { notifyRedirect } = useProtectedButton();
  const onSubmit = async (data) => {
    dispatch(setRedirectAfterLogin(false));
    try {
      const payload = {
        email: data.email,
        password: data.password,
      };
      const res = await authService.login(payload);
      if (res.success === true) {
        dispatch(getCurrentUser());
        toast.success('Đăng nhập thành công', { closeButton: true });
      } else {
        setError('password', {
          type: 'manual',
          message: 'Mật khẩu hoặc tài khoản sai.',
        });
      }
    } catch (err) {
      console.log(err);
      setError('password', {
        type: 'manual',
        message: 'Mật khẩu hoặc tài khoản sai.',
      });

      console.log(errors);
      toast.error('Đăng nhập thất bại', { closeButton: true });
      console.error('Submit failed:', err);
    } finally {
      notifyRedirect();
    }
  };

  const sendCode = async (phone) => {
    try {
      await authService.sendCode(
        { target: phone, action: 'reset_password_by_phone' },
        'phone'
      );
    } catch (error) {
      toast.error('Gửi mã Code thất bại! Vui lòng nhấn gửi lại!');
      console.log(error);
    }
  };

  const verifyCode = async (data) => {
    const { phone, code } = data;
    try {
      await authService.verifyCode({
        phone,
        code,
        action: 'verify_password_by_phone',
      });
      return true;
    } catch (error) {
      setError('code', {
        type: 'manual',
        message: 'Mã xác thực không hợp lệ',
      });
      return false;
    }
  };

  const isFilled = areFieldsFilled(getValues());

  return (
    <>
      <h2 className={styles.H2Title}>Reset Password</h2>
      <div className={styles.DivDescription}>
        Enter phone number
        <Link
          className={styles['ALink-StyledLink']}
          onClick={() => dispatch(setComponent('resetPasswordByEmail'))}
        >
          Reset with email
        </Link>
      </div>
      <Form methods={methods} onSubmit={onSubmit}>
        <div className="DivContainer">
          <PhoneInput
            register={register}
            label="Số điện thoại"
            name="phone"
            watch={watch}
          />
        </div>
        <CodeInput
          name="code"
          label="Nhập mã có 6 chữ số"
          targetField="phone"
          requiredFields={['phone']}
          countDown={60}
          watch={watch}
          register={register}
          onSend={(phone) => sendCode(phone)}
        />
        <Input
          name="password"
          label="Mật khẩu"
          register={register}
          watch={watch}
          isPassword
          onChange={async (e) => {
            await trigger('password');
            if (e.target.value === '') clearErrors('password');
          }}
          errors={errors}
        />
        <Button styledButton type="submit" disabled={!isFilled}>
          Đăng nhập
        </Button>
      </Form>
    </>
  );
}

export default ResetPasswordByPhone;
