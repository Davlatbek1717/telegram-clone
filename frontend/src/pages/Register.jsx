import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';

const validationSchema = Yup.object({
  phone: Yup.string()
    .matches(/^\+998[0-9]{9}$/, 'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak')
    .required('Telefon raqami majburiy'),
  email: Yup.string()
    .email('Email noto\'g\'ri formatda'),
  username: Yup.string()
    .matches(/^@?[a-zA-Z0-9_]{3,32}$/, 'Username 3-32 ta harf, raqam yoki _ dan iborat bo\'lishi kerak'),
  password: Yup.string()
    .min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak')
    .required('Parol majburiy'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Parollar mos kelmayapti')
    .required('Parolni tasdiqlash majburiy'),
  firstName: Yup.string()
    .min(1, 'Ism bo\'sh bo\'lmasligi kerak')
    .max(64, 'Ism 64 ta belgidan oshmasligi kerak')
    .required('Ism majburiy'),
  lastName: Yup.string()
    .max(64, 'Familiya 64 ta belgidan oshmasligi kerak')
});

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      phone: '+998',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Remove @ from username if present
        const username = values.username.startsWith('@') 
          ? values.username 
          : values.username ? `@${values.username}` : '';
        
        await authService.register({
          phone: values.phone,
          email: values.email || undefined,
          username: username || undefined,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName || undefined
        });
        toast.success('Ro\'yxatdan o\'tish muvaffaqiyatli!');
        navigate('/chat');
      } catch (error) {
        const errorData = error.response?.data;
        let message = 'Ro\'yxatdan o\'tishda xatolik yuz berdi';
        
        if (errorData?.error === 'PHONE_EXISTS') {
          message = 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan';
        } else if (errorData?.error === 'EMAIL_EXISTS') {
          message = 'Bu email allaqachon ro\'yxatdan o\'tgan';
        } else if (errorData?.error === 'USERNAME_EXISTS') {
          message = 'Bu username allaqachon band';
        } else if (errorData?.message) {
          message = errorData.message;
        }
        
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Telegram Clone</h1>
          <p>Ro'yxatdan o'tish</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <Input
            label="Telefon raqami"
            type="tel"
            name="phone"
            placeholder="+998901234567"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone && formik.errors.phone}
          />

          <Input
            label="Email (ixtiyoriy)"
            type="email"
            name="email"
            placeholder="email@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
          />

          <Input
            label="Username (ixtiyoriy)"
            type="text"
            name="username"
            placeholder="@username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && formik.errors.username}
          />

          <Input
            label="Ism"
            type="text"
            name="firstName"
            placeholder="Ismingizni kiriting"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.firstName && formik.errors.firstName}
          />

          <Input
            label="Familiya (ixtiyoriy)"
            type="text"
            name="lastName"
            placeholder="Familiyangizni kiriting"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.lastName && formik.errors.lastName}
          />

          <Input
            label="Parol"
            type="password"
            name="password"
            placeholder="Parolingizni kiriting (kamida 8 belgi)"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
          />

          <Input
            label="Parolni tasdiqlash"
            type="password"
            name="confirmPassword"
            placeholder="Parolni qayta kiriting"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />

          <Button type="submit" loading={loading}>
            Ro'yxatdan o'tish
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Akkauntingiz bormi? <Link to="/login">Kirish</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
