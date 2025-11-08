import { Link } from 'react-router-dom';

import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { useState } from 'react';
import PhoneInput from '../../../components/PhoneInput';
import CodeInput from '../../../components/CodeInput';
import { useMemo } from 'react';
import {
  loginPhoneCodeSchema,
  loginPhonePasswordSchema,
} from '../../../schema/loginSchema';
import Form from '../../../components/Form';
import { setComponent } from '../../../features/auth/authSlice';
import Input from '../../../components/Input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '../../../components/Button';
import { areFieldsFilled } from '../../../function/areFieldsFilled';

function LoginPhoneForm() {
  const dispatch = useDispatch();
  const [IsCode, setIsCode] = useState(true);
  let schema = useMemo(
    () => (IsCode ? loginPhoneCodeSchema : loginPhonePasswordSchema),
    [IsCode]
  );
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
    formState: { errors, isSubmitting, isLoading },
  } = methods;

  const onSubmit = async (data) => {
    try {
      console.log('submit data:', data);
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };
  const isFilled = areFieldsFilled(getValues());

  return (
    <>
      <h2 className="H2Title">Đăng nhập</h2>
      <div className={styles.DivDescription}>
        Điện thoại
        <Link
          className={styles['ALink-StyledLink']}
          onClick={() => dispatch(setComponent('emailLogin'))}
        >
          Đăng nhập bằng email hoặc tên người dùng
        </Link>
      </div>
      <Form methods={methods} onSubmit={onSubmit} mode="onSubmit">
        <div className="DivContainer">
          <PhoneInput
            register={register}
            label="Số điện thoại"
            name="phone"
            watch={watch}
          />
        </div>
        {IsCode ? (
          <CodeInput
            name="code"
            label="Nhập mã có 6 chữ số"
            watch={watch}
            register={register}
          />
        ) : (
          <Input label="Mật khẩu" isPassword name="password" watch={watch} />
        )}
        <div className={styles.DivLinkContainer}>
          {!IsCode ? (
            <>
              <Link
                className="ALink"
                onClick={() => dispatch(setComponent('resetPasswordByPhone'))}
              >
                Bạn quên mật khẩu?
              </Link>
              <hr />
            </>
          ) : null}
          <Link
            className={styles['ALink-StyledLink']}
            onClick={() => setIsCode(!IsCode)}
          >
            {IsCode ? 'Đăng nhập bằng mật khẩu' : 'Đăng nhập bằng mã'}
          </Link>
        </div>
        <Button styledButton type="submit" disabled={!isFilled || isSubmitting}>
          Đăng nhập
        </Button>
      </Form>
    </>
  );
}

export default LoginPhoneForm;
