import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import PublicRoute from '../../components/auth/PublicRoute';

const ForgotPasswordPage = () => {
  return (
    <PublicRoute>
      <ForgotPasswordForm />
    </PublicRoute>
  )
};

export default ForgotPasswordPage;