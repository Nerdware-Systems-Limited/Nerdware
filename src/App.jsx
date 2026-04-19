import { Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './redux/store';

import Header from './components/common/Header';
import Footer from './components/common/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Error404 from './pages/Error404';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/Changepassword';
import Profile from './pages/Profile';

// Admin imports
import AdminLayout    from './components/admin/AdminLayout';
import AdminOverview  from './pages/admin/AdminOverview';
import AdminBlogList  from './pages/admin/AdminBlogList';
import AdminBlogForm  from './pages/admin/AdminBlogForm';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminPortfolio from './pages/admin/AdminPortfolio';
import AdminMessages from './pages/admin/AdminMessages';
import AdminApplications from './pages/admin/AdminApplications';
import AdminNewsletter from './pages/admin/AdminNewsletter';

// ── Public layout (has Header + Footer) ──────────────────────────────────────
const Layout = () => (
  <Provider store={store}>
    <HelmetProvider>
      <div className="app">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </HelmetProvider>
  </Provider>
);

// ── Admin layout wrapper (no Header / Footer) ─────────────────────────────────
// AdminLayout itself handles auth-guarding, sidebar, topbar, and <Outlet />.
// We still need Provider + HelmetProvider around it.
const AdminRoot = () => (
  <Provider store={store}>
    <HelmetProvider>
      <AdminLayout />
    </HelmetProvider>
  </Provider>
);

// ── Routes (data-router format) ───────────────────────────────────────────────
export const routes = [
  // ── Public routes (with Header + Footer) ───────────────────────────────────
  {
    path: '/',
    element: <Layout />,
    errorElement: <Error404 />,
    children: [
      { index: true,             element: <Home /> },
      { path: 'login',           element: <Login /> },
      { path: 'register',        element: <Register /> },
      { path: 'change-password', element: <ChangePassword /> },
      { path: 'profile',         element: <Profile /> },
      { path: 'about',           element: <About /> },
      { path: 'services',        element: <Services /> },
      { path: 'portfolio',       element: <Portfolio /> },
      { path: 'blog',            element: <Blog /> },
      { path: 'blog/:slug',      element: <BlogDetail /> },
      { path: 'contact',         element: <Contact /> },
      { path: '*',               element: <Error404 /> },
    ],
  },

  // ── Admin routes (no Header / Footer) ──────────────────────────────────────
  {
    path: 'admin',
    element: <AdminRoot />,
    children: [
      { index: true,           element: <AdminOverview /> },
      { path: 'blog',          element: <AdminBlogList /> },
      { path: 'blog/new',      element: <AdminBlogForm /> },
      { path: 'blog/edit/:id', element: <AdminBlogForm /> },
      { path: 'portfolio',     element: <AdminPortfolio /> },
      { path: 'users',         element: <AdminUsers /> },
      { path: 'messages',      element: <AdminMessages /> },
      { path: 'applications',  element: <AdminApplications /> },
      {path: 'newsletter',     element: <AdminNewsletter /> },
    ],
  },
];

// Required by vite-react-ssg
export default function App() {
  return null;
}