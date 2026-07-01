import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import RoleRedirect from './components/RoleRedirect';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import PresidentDashboard from './pages/dashboard/PresidentDashboard';
import ResidentDashboard from './pages/dashboard/ResidentDashboard';
import ResidentAnnouncements from './pages/resident/announcements';
import Announcements from './pages/president/announcements';
import NewTicket from './pages/resident/newTicket';
import MyTickets from './pages/resident/myTicket';
import Login from './pages/login/login';
import Signup from './pages/signup/signup';
import CreateCommunity from './pages/president/CreateCommunity';
import TicketDetail from './components/tickets/TicketDetail';
import AllTickets from './pages/president/allTickets';
import ManageCommunity from './pages/president/ManageCommunity';
import Profile from './pages/common/Profile';

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = ["/", "/signup"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {!isAuthPage && <Sidebar />}
      <div className={!isAuthPage ? "lg:pl-64 flex flex-col min-h-screen" : "min-h-screen"}>
        {!isAuthPage && <Navbar />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Shared Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/redirect" element={<RoleRedirect />} />
                  <Route path="/tickets/:ticketId" element={<TicketDetail />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* President Routes */}
                <Route element={<ProtectedRoute allowedRoles={['PRESIDENT']} />}>
                  <Route path="/create-community" element={<CreateCommunity />} />
                  <Route path="/president/dashboard" element={<PresidentDashboard />} />
                  <Route path="/president/announcements" element={<Announcements />} />
                  <Route path="/president/tickets" element={<AllTickets />} />
                  <Route path="/president/manage-community" element={<ManageCommunity />} />
                </Route>

                {/* Resident Routes */}
                <Route element={<ProtectedRoute allowedRoles={['RESIDENT']} />}>
                  <Route path="/resident/dashboard" element={<ResidentDashboard />} />
                  <Route path="/resident/new-ticket" element={<NewTicket />} />
                  <Route path="/resident/my-tickets" element={<MyTickets />} />
                  <Route path="/resident/announcements" element={<ResidentAnnouncements />} />
                  <Route path="/resident/new-ticket/:id" element={<NewTicket />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
