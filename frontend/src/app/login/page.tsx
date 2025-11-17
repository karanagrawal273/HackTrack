import LoginForm from '../../components/auth/LoginForm';
import PublicRoute from '../../components/auth/PublicRoute';

const LoginPage = () => {
  return (
    <PublicRoute>
      <LoginForm />
    </PublicRoute>
  );
};

export default LoginPage;