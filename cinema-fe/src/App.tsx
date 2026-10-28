import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import BookingSeatPage from "./pages/BookingSeatPage";
import MyTicketsPage from "./pages/MyTicketsPage";


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/vouchers" element={<VouchersPage />} />
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
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute>
              <AdminRoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/movies"
          element={
            <ProtectedRoute>
              <AdminMoviesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/showtimes"
          element={
            <ProtectedRoute>
              <AdminShowtimesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/news"
          element={
            <ProtectedRoute>
              <AdminNewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vouchers"
          element={
            <ProtectedRoute>
              <AdminVouchersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
