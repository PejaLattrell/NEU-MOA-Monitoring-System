import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// View placeholders
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import UserManagement from './pages/UserManagement';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/unauthorized" replace />;
  
  return children;
}

function DefaultRoleRedirect() {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;

  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'faculty':
      return <Navigate to="/faculty" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DefaultRoleRedirect />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="faculty" element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />
            <Route path="student" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
          </Route>
          
          <Route path="/unauthorized" element={<div className="p-10 text-center"><h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1></div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
