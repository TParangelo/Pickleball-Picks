import React, { Suspense } from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import { CurPicksProvider } from "./contexts/CurPicks";
import ScrollToTop from './components/ScrollToTop';
import User from "./pages/User";
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMatches from './pages/admin/AdminMatches';
import AdminUsers from './pages/admin/AdminUsers';
import AddMatch from "./pages/admin/AddMatch";
import SEO from './components/SEO';
import Sitemap from './pages/Sitemap';
import SitemapXML from './components/SitemapXML';
import AddMatchHelper from "./pages/Admin/AddMatchHelper";
// Lazy load all route components
const Home = React.lazy(() => import("./pages/Home"));
const Matches = React.lazy(() => import("./pages/Matches"));
const Leaderboard = React.lazy(() => import("./pages/Leaderboard"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Profile = React.lazy(() => import("./pages/Profile"));
const About = React.lazy(() => import("./pages/About"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // Data stays fresh for 2 minutes
      cacheTime: 1000 * 60 * 2, // Cache persists for 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: '#4CAF50'
  }}>
    Loading...
  </div>
);

function App() {
    return (
        <Router>
            <ScrollToTop />
            <AuthProvider>
                <CurPicksProvider>
                    <QueryClientProvider client={queryClient}>
                        <div className="App">
                            <NavBar />
                            <main className="main-content">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <Routes>
                                        <Route path="/sitemap.xml" element={<SitemapXML />} />
                                        <Route path="/" element={
                                            <>
                                                <SEO 
                                                    title="PicklePicks - Home"
                                                    description="Welcome to PicklePicks - Your premier platform for pickleball match predictions and social betting."
                                                />
                                                <Home />
                                            </>
                                        } />
                                        <Route path="/matches" element={
                                            <>
                                                <SEO 
                                                    title="PicklePicks - Matches"
                                                    description="View and bet on live pickleball matches with real-time odds and updates."
                                                />
                                                <Matches />
                                            </>
                                        } />
                                        <Route path="/leaderboard" element={
                                            <>
                                                <SEO 
                                                    title="PicklePicks - Leaderboard"
                                                    description="See how you rank against other players in our pickleball betting community."
                                                />
                                                <Leaderboard />
                                            </>
                                        } />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/profile" element={
                                            <>
                                                <SEO 
                                                    title="PicklePicks - Profile"
                                                    description="Track your betting history, manage your account, and view your performance."
                                                />
                                                <Profile />
                                            </>
                                        } />
                                        <Route path="/about" element={<About />} />
                                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                        <Route path="/terms-of-service" element={<TermsOfService />} />
                                        <Route path="/forgot-password" element={<ForgotPassword />} />
                                        <Route path="/reset-password" element={<ResetPassword />} />
                                        <Route path="/user/:username" element={<User />} />
                                        <Route path="/admin/login" element={<AdminLogin />} />
                                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                        <Route path="/admin/matches" element={<AdminMatches />} />
                                        <Route path="/admin/users" element={<AdminUsers />} />
                                        <Route path="/admin/add-match" element={<AddMatch />} />
                                        <Route path="/admin/add-match-helper" element={<AddMatchHelper />} />
                                    </Routes>
                                </Suspense>
                                <Footer />
                            </main>
                        </div>
                    </QueryClientProvider>
                </CurPicksProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
