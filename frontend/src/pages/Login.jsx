import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';

const validationSchema = Yup.object({
  identifier: Yup.string()
    .required('Username, email yoki telefon majburiy'),
  password: Yup.string()
    .required('Parol majburiy')
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      identifier: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await authService.login(values);
        toast.success('Tizimga muvaffaqiyatli kirdingiz!');
        navigate('/chat');
      } catch (error) {
        const errorData = error.response?.data;
        let message = 'Tizimga kirishda xatolik yuz berdi';
        
        if (errorData?.error === 'INVALID_CREDENTIALS') {
          message = errorData.message;
          if (errorData.attemptsLeft) {
            message += ` (${errorData.attemptsLeft} ta urinish qoldi)`;
          }
        } else if (errorData?.error === 'ACCOUNT_LOCKED') {
          message = errorData.message;
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
          <p>Tizimga kirish</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <Input
            label="Username, Email yoki Telefon"
            type="text"
            name="identifier"
            placeholder="@username, email yoki +998901234567"
            value={formik.values.identifier}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.identifier && formik.errors.identifier}
          />

          <Input
            label="Parol"
            type="password"
            name="password"
            placeholder="Parolingizni kiriting"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
          />

          <Button type="submit" loading={loading}>
            Kirish
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Akkauntingiz yo'qmi? <Link to="/register">Ro'yxatdan o'tish</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
