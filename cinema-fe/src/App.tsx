import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MovieShowtimesPage from "./pages/MovieShowtimesPage";
import SchedulePage from "./pages/SchedulePage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminRoomsPage from "./pages/AdminRoomsPage";
import AdminMoviesPage from "./pages/AdminMoviesPage";
import AdminShowtimesPage from "./pages/AdminShowtimesPage";
import AdminNewsPage from "./pages/AdminNewsPage";
import AdminVouchersPage from "./pages/AdminVouchersPage";
import NewsPage from "./pages/NewsPage";
import VouchersPage from "./pages/VouchersPage";
import TicketsPage from "./pages/TicketsPage";
import BookingSeatPage from "./pages/BookingSeatPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import CustomerLayout from "./components/CustomerLayout";
import AdminLayout from "./components/admin/AdminLayout";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

function DashboardRoute() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <DashboardPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Customer Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:movieId/showtimes" element={<MovieShowtimesPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/vouchers" element={<VouchersPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route element={<CustomerLayout />}>
        <Route
          path="/booking/:showtimeId"
          element={
            <ProtectedRoute>
              <BookingSeatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />
        </Route>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route element={<CustomerLayout />}>
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        </Route>

        {/* ── Admin Management Routes with Persistent Dynamic Sidebar ── */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/movies" element={<AdminMoviesPage />} />
          <Route path="/admin/showtimes" element={<AdminShowtimesPage />} />
          <Route path="/admin/rooms" element={<AdminRoomsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/news" element={<AdminNewsPage />} />
          <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
