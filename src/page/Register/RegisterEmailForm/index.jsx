//Library
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { yupResolver } from '@hookform/resolvers/yup';

//Style, UI Component
import styles from './styles.module.scss';
import AgeSelector from '../../../components/AgeSelector';
import CodeInput from '../../../components/CodeInput';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import CheckBox from '../../../components/CheckBox';
import Form from '../../../components/Form';

//Function
import { registerEmailSchema } from '../../../schema/registerSchema';
import { setComponent, setRegister } from '../../../features/auth/authSlice';
import { areFieldsFilled } from '../../../function/areFieldsFilled';

//API
import authService from '../../../services/auth/auth.service';

function RegisterEmailForm() {
  const dispatch = useDispatch();
  //Method cho Form
  const methods = useForm({
    resolver: yupResolver(registerEmailSchema),
    mode: 'onSubmit',
  });

  const {
    watch,
    trigger,
    register,
    getValues,
    setValue,
    clearErrors,
    setError,
    formState: { errors, isSubmitting, isLoading },
  } = methods;

  const [open, setOpen] = useState(false); //Cái này là chế độ notice Password
  const [password, setPassword] = useState('');
  const [strongPassword, setStrongPassword] = useState({
    length: false,
    specialCharacter: false,
  });

  const [emailExits, setEmailExits] = useState(false);

  const boxRef = useRef(null);

  //Notice password
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  //Validator Password
  useEffect(() => {
    const checkPasswordStrength = (password) => {
      const lengthPass = password.length >= 8 && password.length <= 20;
      const specialPass = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
      return {
        length: lengthPass,
        specialCharacter: specialPass.test(password),
      };
    };
    setStrongPassword(checkPasswordStrength(password));
  }, [password]);

  //Action: Send Code
  const sendCode = async (email) => {
    try {
      await authService.sendCode(
        { target: email, action: 'verify_email' },
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
      await authService.verifyCode({ email, code, action: 'verify_email' });
      return true;
    } catch (error) {
      setError('code', {
        type: 'manual',
        message: 'Mã xác thực không hợp lệ',
      });
      return false;
    }
  };

  const checkEmail = async (data) => {
    try {
      const res = await authService.checkEmail(data);
      if (res) return true;
      return false;
    } catch (error) {
      return false;
    }
  };

  //Đưa dữ liệu cho bước cuối cùng
  const onSubmit = async (data) => {
    try {
      const verified = await verifyCode(data);
      const email = await checkEmail(data);
      if (email) {
        setEmailExits(true);
        throw new Error('Email đã tồn tại');
      } else {
        setEmailExits(false);
      }
      if (!verified) {
        throw new Error('Lỗi xác thực');
      }
      const { code, ...payload } = data;
      dispatch(setRegister(payload));
      dispatch(setComponent('finalRegister'));
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  const isFilled = areFieldsFilled(getValues());

  return (
    <>
      <Form onSubmit={onSubmit} methods={methods}>
        <h2 className="H2Title">Đăng ký</h2>
        <div className={styles.DivTitle}>
          Vui lòng cho biết ngày sinh của bạn
        </div>
        <AgeSelector
          day={watch('day')}
          month={watch('month')}
          year={watch('year')}
          errors={errors}
          watch={watch}
          setValue={setValue}
          onChange={(field, value) => {
            setValue(field, value);
          }}
        />
        <div className={styles.DivDescription}>
          Email
          <Link
            className="ALink"
            onClick={() => dispatch(setComponent('phoneRegister'))}
          >
            Đăng ký bằng số điện thoại
          </Link>
        </div>
        <div>
          <Input
            label={'Địa chỉ email'}
            name={'email'}
            register={register}
            errors={errors}
            watch={watch}
            onFocus={() => clearErrors('email')}
            onBlur={async (e) => {
              if (e.target.value !== '') await trigger('email');
            }}
            onKeyDown={(e) => {
              if ([' '].includes(e.key)) e.preventDefault();
            }}
          />
          {emailExits && (
            <p className={styles.PRegister}>
              Bạn đã đăng ký,
              <Link className={styles.ALink}>
                <span className={styles.SpanLink}>
                  Đăng nhập <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </Link>
            </p>
          )}
        </div>
        <div
          className={styles.DivContainer}
          ref={boxRef}
          onFocus={() => setOpen(true)}
        >
          <Input
            label="Mật khẩu"
            name="password"
            register={register}
            isPassword
            errors={errors}
            onBlur={async (e) => {
              if (e.target.value !== '') await trigger('password');
            }}
            onChange={async (e) => {
              await trigger('password');
              setPassword(e.target.value);
              if (e.target.value === '') clearErrors('password');
            }}
            watch={watch}
          />
          {(open || errors.password) && (
            <>
              <p className={styles.PDescriptionTitleContainer}>
                Mật khẩu của bạn phải gồm:
              </p>
              <div
                className={styles.DivTextContainer}
                style={{ color: strongPassword.length ? '#00FF99' : 'inherit' }}
              >
                {strongPassword.length ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  <span style={{ marginRight: '10px' }}></span>
                )}
                <span>8 đến 20 ký tự</span>
              </div>
              <div
                className={styles.DivTextContainer}
                style={{
                  color: strongPassword.specialCharacter
                    ? '#00FF99'
                    : 'inherit',
                }}
              >
                {strongPassword.specialCharacter ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  <span style={{ marginRight: '10px' }}></span>
                )}
                <span>Các chữ cái số và ký tự đặc biệt</span>
              </div>
            </>
          )}
        </div>

        <CodeInput
          name="code"
          targetField="email"
          requiredFields={['day', 'month', 'year', 'email']}
          countDown={60}
          errors={errors}
          trigger={trigger}
          register={register}
          clearErrors={clearErrors}
          getValues={getValues}
          onSend={(email) => sendCode(email)}
          watch={watch}
        />
        <CheckBox
          label={
            'Nhận nội dung thịnh hành, bản tin, khuyến mại, đề xuất và thông tin cập nhật tài khoản được gửi đến email của bạn'
          }
        />
        <Button
          styledButton
          type="submit"
          disabled={!isFilled || isSubmitting || isLoading}
        >
          Tiếp
        </Button>
      </Form>
    </>
  );
}

export default RegisterEmailForm;
