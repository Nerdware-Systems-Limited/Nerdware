import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './redux/store';
import { AuthModalProvider } from './context/AuthModalContext';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AuthModal from './components/common/AuthModal';

// ── Public pages (lazy-loaded — each becomes its own chunk) ──────────────────
const Home           = lazy(() => import('./pages/Home'));
const About          = lazy(() => import('./pages/About'));
const Services       = lazy(() => import('./pages/Services'));
const Portfolio      = lazy(() => import('./pages/Portfolio'));
const Blog           = lazy(() => import('./pages/Blog'));
const BlogDetail     = lazy(() => import('./pages/BlogDetail'));
const Contact        = lazy(() => import('./pages/Contact'));
const Error404       = lazy(() => import('./pages/Error404'));
const ChangePassword = lazy(() => import('./pages/Changepassword'));
const Profile        = lazy(() => import('./pages/Profile'));
const OAuthCallback   = lazy(() => import('./pages/OAuthCallback'));

// ── Admin pages (lazy-loaded — rarely visited, keeps main bundle small) ───────
const AdminLayout       = lazy(() => import('./components/admin/AdminLayout'));
const AdminOverview     = lazy(() => import('./pages/admin/AdminOverview'));
const AdminBlogList     = lazy(() => import('./pages/admin/AdminBlogList'));
const AdminBlogForm     = lazy(() => import('./pages/admin/AdminBlogForm'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));
const AdminPortfolio    = lazy(() => import('./pages/admin/AdminPortfolio'));
const AdminMessages     = lazy(() => import('./pages/admin/AdminMessages'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
const AdminNewsletter   = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminTestimonial  = lazy(() => import('./pages/admin/AdminTestimonial'));

// ── Public layout (Header + Outlet + Footer) ──────────────────────────────────
// /login and /register don't get their own page shell — AuthModalProvider watches
// the route and pops the sign-in/sign-up modal on top of whatever renders beneath,
// 9GAG-style. The header and footer are still mounted but sit dimmed behind it.
const Layout = () => (
  <Provider store={store}>
    <HelmetProvider>
      <AuthModalProvider>
        <div className="app">
          <Header />
          {/* null fallback avoids a server/client <div> mismatch during hydration */}
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
          <Footer />
          <AuthModal />
        </div>
      </AuthModalProvider>
    </HelmetProvider>
  </Provider>
);

// ── Admin layout wrapper (no Header / Footer) ─────────────────────────────────
// AdminLayout itself handles auth-guarding, sidebar, topbar, and <Outlet />.
const AdminRoot = () => (
  <Provider store={store}>
    <HelmetProvider>
      <Suspense fallback={null}>
        <AdminLayout />
      </Suspense>
    </HelmetProvider>
  </Provider>
);

// ── Routes (data-router format) ───────────────────────────────────────────────
export const routes = [
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: '/',
    element: <Layout />,
    errorElement: <Error404 />,
    children: [
      { index: true,             element: <Home /> },
      // Rendered content behind the modal — AuthModalProvider detects these paths
      // and opens the sign-in / sign-up modal over the home page.
      { path: 'login',           element: <Home /> },
      { path: 'register',        element: <Home /> },
      { path: 'change-password', element: <ChangePassword /> },
      { path: 'profile',         element: <Profile /> },
      { path: 'about',           element: <About /> },
      { path: 'services',        element: <Services /> },
      { path: 'portfolio',       element: <Portfolio /> },
      { path: 'blog',            element: <Blog /> },
      { path: 'blog/:slug',      element: <BlogDetail /> },
      { path: 'contact',         element: <Contact /> },
      { path: 'oauth/callback',  element: <OAuthCallback /> },
      { path: '*',               element: <Error404 /> },
    ],
  },

  // ── Admin routes ────────────────────────────────────────────────────────────
  {
    path: 'admin',
    element: <AdminRoot />,
    children: [
      { index: true,             element: <AdminOverview /> },
      { path: 'blog',            element: <AdminBlogList /> },
      { path: 'blog/new',        element: <AdminBlogForm /> },
      { path: 'blog/edit/:id',   element: <AdminBlogForm /> },
      { path: 'portfolio',       element: <AdminPortfolio /> },
      { path: 'users',           element: <AdminUsers /> },
      { path: 'messages',        element: <AdminMessages /> },
      { path: 'applications',    element: <AdminApplications /> },
      { path: 'newsletter',      element: <AdminNewsletter /> },
      { path: 'testimonial',     element: <AdminTestimonial /> },
    ],
  },
];

// Required by vite-react-ssg
export default function App() {
  return null;
}