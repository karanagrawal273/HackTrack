import PublicRoute from '../../components/auth/PublicRoute';
import DashboardPage from '../../components/dashboard/page';

const Dashboard_Page = () => {
  return (
    <PublicRoute>
      <DashboardPage/>
    </PublicRoute>
  );
};

export default Dashboard_Page;