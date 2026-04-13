import { Routes, Route } from 'react-router-dom';

// Public
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Organizer
import Dashboard from './pages/organizer/Dashboard';
import RegisterEvent from './pages/organizer/RegisterEvent';
import Estimate from './pages/organizer/Estimate';
import LiveLog from './pages/organizer/LiveLog';
import Report from './pages/organizer/Report';
import Certificate from './pages/organizer/Certificate';
import Profile from './pages/organizer/Profile';

// BMC
import Overview from './pages/bmc/Overview';
import EventsList from './pages/bmc/EventsList';
import Scheduler from './pages/bmc/Scheduler';
import AuditLog from './pages/bmc/AuditLog';
import Analytics from './pages/bmc/Analytics';
import EventDetail from './pages/bmc/EventDetail';
import WeeklyPlan from './pages/bmc/WeeklyPlan';
import WardSettings from './pages/bmc/WardSettings';

export default function App() {
  return (
    <Routes>
      {/* Public — unified login & register for both roles */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Organizer — protected */}
      <Route path="/organizer/dashboard" element={
        <ProtectedRoute role="organizer"><Dashboard /></ProtectedRoute>
      } />
      <Route path="/organizer/events" element={
        <ProtectedRoute role="organizer"><Dashboard /></ProtectedRoute>
      } />
      <Route path="/organizer/live-logs" element={
        <ProtectedRoute role="organizer"><Dashboard /></ProtectedRoute>
      } />
      <Route path="/organizer/reports" element={
        <ProtectedRoute role="organizer"><Dashboard /></ProtectedRoute>
      } />
      <Route path="/organizer/certificates" element={
        <ProtectedRoute role="organizer"><Dashboard /></ProtectedRoute>
      } />
      <Route path="/organizer/register" element={
        <ProtectedRoute role="organizer"><RegisterEvent /></ProtectedRoute>
      } />
      <Route path="/organizer/estimate/:id" element={
        <ProtectedRoute role="organizer"><Estimate /></ProtectedRoute>
      } />
      <Route path="/organizer/live-log/:id" element={
        <ProtectedRoute role="organizer"><LiveLog /></ProtectedRoute>
      } />
      <Route path="/organizer/report/:id" element={
        <ProtectedRoute role="organizer"><Report /></ProtectedRoute>
      } />
      <Route path="/organizer/certificate/:id" element={
        <ProtectedRoute role="organizer"><Certificate /></ProtectedRoute>
      } />
      <Route path="/organizer/profile" element={
        <ProtectedRoute role="organizer"><Profile /></ProtectedRoute>
      } />

      {/* BMC — protected (no /bmc/login or /bmc/register needed) */}
      <Route path="/bmc/overview" element={
        <ProtectedRoute role="bmc"><Overview /></ProtectedRoute>
      } />
      <Route path="/bmc/events" element={
        <ProtectedRoute role="bmc"><EventsList /></ProtectedRoute>
      } />
      <Route path="/bmc/scheduler" element={
        <ProtectedRoute role="bmc"><Scheduler /></ProtectedRoute>
      } />
      <Route path="/bmc/audit" element={
        <ProtectedRoute role="bmc"><AuditLog /></ProtectedRoute>
      } />
      <Route path="/bmc/analytics" element={
        <ProtectedRoute role="bmc"><Analytics /></ProtectedRoute>
      } />
      <Route path="/bmc/events/:id" element={
        <ProtectedRoute role="bmc"><EventDetail /></ProtectedRoute>
      } />
      <Route path="/bmc/weekly-plan" element={
        <ProtectedRoute role="bmc"><WeeklyPlan /></ProtectedRoute>
      } />
      <Route path="/bmc/settings" element={
        <ProtectedRoute role="bmc"><WardSettings /></ProtectedRoute>
      } />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
