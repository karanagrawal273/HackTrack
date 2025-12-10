// app/dashboard/page.tsx

import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import  DashboardContent from '@/components/DashboardContent';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="pt-16"> 
          <DashboardContent />
        </div>
    </ProtectedRoute>
  );
}