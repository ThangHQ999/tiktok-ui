import * as yup from 'yup';

export const ResetPasswordByEmailSchema = yup
  .object({
    phone: yup
      .string()
      .matches(/^\d+$/, 'Nhập số điện thoại hợp lệ')
      .required('Không được để trống mã kiểm tra'),
    code: yup
      .string()
      .matches(/^\d+$/, 'Phải nhập mã có 6 chữ số')
      .length(6, 'Phải nhập mã có 6 chữ số')
      .required('Không được để trống mã kiểm tra'),
    password: yup
      .string()
      .matches(
        /^(?!.*\s)[A-Za-z0-9!@#$%^&*()_+\-=[\];:,.<>?/|~]+$/,
        'Ký tự đặc biệt không hợp lệ'
      )
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .required('Vui lòng nhập mật khẩu'),
  })
  .required();

export const ResetPasswordByPhoneSchema = yup
  .object({
    phone: yup
      .string()
      .matches(/^\d+$/, 'Nhập số điện thoại hợp lệ')
      .required('Vui lòng nhập số điện thoại'),
    password: yup
      .string()
      .matches(
        /^(?!.*\s)[A-Za-z0-9!@#$%^&*()_+\-=[\];:,.<>?/|~]+$/,
        'Ký tự đặc biệt không hợp lệ'
      )
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .required('Vui lòng nhập mật khẩu'),
    code: yup
      .string()
      .matches(/^\d+$/, 'Phải nhập mã có 6 chữ số')
      .length(6, 'Phải nhập mã có 6 chữ số')
      .required('Không được để trống mã kiểm tra'),
  })
  .required();

export default { ResetPasswordByEmailSchema, ResetPasswordByPhoneSchema };

//Xác minh không thành công. Vui lòng nhấp vào Gửi lại và thử lần nữa.
//Người dùng không tồn tại
