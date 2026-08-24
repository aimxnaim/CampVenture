import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import CampgroundsPage from './pages/CampgroundsPage.jsx';
import CampgroundDetailPage from './pages/CampgroundDetailPage.jsx';
import NewCampgroundPage from './pages/NewCampgroundPage.jsx';
import EditCampgroundPage from './pages/EditCampgroundPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="campgrounds" element={<CampgroundsPage />} />
            <Route path="campgrounds/new" element={<ProtectedRoute><NewCampgroundPage /></ProtectedRoute>} />
            <Route path="campgrounds/:campgroundId" element={<CampgroundDetailPage />} />
            <Route path="campgrounds/:campgroundId/edit" element={<ProtectedRoute><EditCampgroundPage /></ProtectedRoute>} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
