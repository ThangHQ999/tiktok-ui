import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import styles from './styles.module.scss';
import { useMemo } from 'react';
import Form from '../../../components/Form';
import Input from '../../../components/Input';
import authService from '../../../services/auth/auth.service';
import { setComponent } from '../../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '../../../components/Button';
import { areFieldsFilled } from '../../../function/areFieldsFilled';
import { useProtectedButton } from '../../../contexts/ProtectedButtonContext';
import { ResetPasswordByEmailSchema } from '../../../schema/resetPasswordSchema';
import CodeInput from '../../../components/CodeInput';

function ResetPasswordByEmail() {
  const dispatch = useDispatch();
  let schema = useMemo(() => ResetPasswordByEmailSchema, []);
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

  const onSubmit = async (data) => {
    try {
      const verified = await verifyCode(data);
      await authService.resetPassword(data);
      if (!verified) {
        throw new Error('Lỗi xác thực');
      }
    } catch (err) {
      console.error('failed:', err);
    }
  };

  const sendCode = async (email) => {
    console.log('code');
    try {
      await authService.sendCode(
        { target: email, action: 'reset_password_by_email', email: email },
        'email'
      );
    } catch (error) {
      toast.error('Gửi mã Code thất bại! Vui lòng nhấn gửi lại!');
      console.log(error);
    }
  };

  const verifyCode = async (data) => {
    const { email, code } = data;
    try {
      await authService.verifyCode({
        email,
        code,
        action: 'verify_reset_password_by_email',
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
        Enter email address
        <Link
          className={styles['ALink-StyledLink']}
          onClick={() => dispatch(setComponent('resetPasswordByPhone'))}
        >
          Reset with phone
        </Link>
      </div>
      <Form methods={methods} onSubmit={onSubmit}>
        <Input
          name={'email'}
          label="Email address"
          errors={errors}
          register={register}
        />
        <CodeInput
          name="code"
          targetField="email"
          requiredFields={['email']}
          countDown={60}
          errors={errors}
          trigger={trigger}
          register={register}
          clearErrors={clearErrors}
          getValues={getValues}
          onSend={(email) => sendCode(email)}
          watch={watch}
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

export default ResetPasswordByEmail;
