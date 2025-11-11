import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';

import PresidentDashboard from './pages/dashboard/PresidentDashboard';

import ResidentDashboard from './pages/dashboard/ResidentDashboard';
import ViewAnnouncements from './pages/resident/announcements';
import Announcements from './pages/president/announcements';
import NewTicket from './pages/resident/newTicket';
import MyTickets from './pages/resident/myTicket';
import RoleRedirect from './components/RoleRedirect';
import Login from './pages/login/login';
import Signup from './pages/signup/signup';

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {!isAuthPage && <Sidebar />}
      <div className={!isAuthPage ? "lg:pl-64" : ""}>
        {!isAuthPage && <Navbar />}
        <main>{children}</main>
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
                <Route path="/gdfg" element={<RoleRedirect />} />
                <Route path="/president/dashboard" element={<PresidentDashboard />} />  
                <Route path="/president/tickets" element={<PresidentDashboard />} />
                <Route path="/president/announcements" element={<Announcements />} />
                <Route path="/resident/dashboard" element={<ResidentDashboard />} />
                <Route path="/resident/new-ticket" element={<NewTicket />} />
                <Route path="/resident/my-tickets" element={<MyTickets />} />
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/tickets/:ticketId" element={<NewTicket />} />
                <Route path="/resident/new-ticket/:id" element={<NewTicket />} />


              </Routes>
            </Layout>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
