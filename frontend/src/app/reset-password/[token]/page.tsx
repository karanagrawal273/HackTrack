import ResetPasswordForm from '../../../components/auth/ResetPasswordForm';
import PublicRoute from '../../../components/auth/PublicRoute';

const ResetPasswordTokenPage = () => {
  return (
    <PublicRoute>
      <ResetPasswordForm />
    </PublicRoute>
  )
};

export default ResetPasswordTokenPage;