import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import styles from './styles.module.scss';
import PhoneInput from '../../../components/PhoneInput';
import CodeInput from '../../../components/CodeInput';
import AgeSelector from '../../../components/AgeSelector';

import Form from '../../../components/Form';
import { registerPhoneSchema } from '../../../schema/registerSchema';
import { setComponent, setRegister } from '../../../features/auth/authSlice';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '../../../components/Button';
import { areFieldsFilled } from '../../../function/areFieldsFilled';
import authService from '../../../services/auth/auth.service';
import { toast } from 'react-toastify';

function RegisterPhoneForm() {
  const dispatch = useDispatch();
  const methods = useForm({
    resolver: yupResolver(registerPhoneSchema),
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

  const sendCode = async (phone) => {
    try {
      await authService.sendCode(
        { target: phone, action: 'verify_phone' },
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
      await authService.verifyCode({ phone, code, action: 'verify_phone' });
      return true;
    } catch (error) {
      setError('code', {
        type: 'manual',
        message: 'Mã xác thực không hợp lệ',
      });
      return false;
    }
  };

  const onSubmit = async (data) => {
    try {
      const verified = await verifyCode(data);

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
      <Form methods={methods} onSubmit={onSubmit}>
        <h2 className="H2Title">Đăng ký</h2>
        <div className={styles.DivTitle}>
          Vui lòng cho biết ngày sinh của bạn
        </div>
        <AgeSelector
          day={watch('day')}
          month={watch('month')}
          year={watch('year')}
          errors={errors}
          onChange={(field, value) => setValue(field, value)}
          watch={watch}
        />
        <div className={styles.DivDescription}>
          Điện thoại
          <Link
            className="ALink"
            onClick={() => dispatch(setComponent('emailRegister'))}
          >
            Đăng ký bằng email
          </Link>
        </div>
        <PhoneInput
          register={register}
          label="Số điện thoại"
          name="phone"
          watch={watch}
        />
        <CodeInput
          name="code"
          targetField="phone"
          requiredFields={['day', 'month', 'year', 'phone']}
          countDown={60}
          errors={errors}
          trigger={trigger}
          register={register}
          clearErrors={clearErrors}
          getValues={getValues}
          watch={watch}
          onSend={(phone) => sendCode(phone)}
        />
        <Button styledButton type="submit" disabled={!isFilled || isSubmitting}>
          Tiếp
        </Button>
      </Form>
    </>
  );
}

export default RegisterPhoneForm;
