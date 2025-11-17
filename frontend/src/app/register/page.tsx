import RegisterForm from '../../components/auth/RegisterForm';
import PublicRoute from '../../components/auth/PublicRoute';

const RegisterPage = () => {
  return (
    <PublicRoute>
      <RegisterForm />
    </PublicRoute>
  );
};

export default RegisterPage;