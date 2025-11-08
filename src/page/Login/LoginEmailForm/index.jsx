import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import styles from './styles.module.scss';
import { loginEmailPasswordSchema } from '../../../schema/loginSchema';
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

function LoginEmailForm() {
  const dispatch = useDispatch();
  const authReducer = useSelector((state) => state.auth);
  let schema = useMemo(() => loginEmailPasswordSchema, []);
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
  const isFilled = areFieldsFilled(getValues());

  return (
    <>
      <h2 className={styles.H2Title}>Đăng nhập</h2>
      <div className={styles.DivDescription}>
        Email hoặc TikTok ID
        <Link
          className={styles['ALink-StyledLink']}
          onClick={() => dispatch(setComponent('phoneLogin'))}
        >
          Đăng nhập bằng số điện thoại
        </Link>
      </div>
      <Form methods={methods} onSubmit={onSubmit}>
        <Input
          name={'email'}
          label="Email hoặc TikTok ID"
          errors={errors}
          register={register}
        />
        {/* Sai tài khoản hoặc mật khẩu. */}
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
        <Link
          className={styles['ALink-StyledLink']}
          onClick={() => dispatch(setComponent('resetPasswordByEmail'))}
        >
          Bạn quên mật khẩu?
        </Link>
        <Button styledButton type="submit" disabled={!isFilled}>
          Đăng nhập
        </Button>
      </Form>
    </>
  );
}

export default LoginEmailForm;
