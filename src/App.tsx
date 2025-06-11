import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { LandingPage } from "@/components/LandingPage";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserDashboard } from "@/components/user/UserDashboard";
import { RepositoryDetail } from "@/components/repository/RepositoryDetail";
import NotFound from "./pages/NotFound";
import GithubCallback from "./pages/GithubCallback.tsx";

const queryClient = new QueryClient();

function DashboardRouter() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route 
          path="/repository/:id" 
          element={
            <ProtectedRoute>
              <RepositoryDetail />
            </ProtectedRoute>
          } 
        />
        <Route path="/github-callback" element={<GithubCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
