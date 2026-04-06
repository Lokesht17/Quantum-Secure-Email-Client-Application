import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EmailListPage from "./pages/EmailListPage";
import Compose from "./pages/Compose";
import Profile from "./pages/Profile";
import SecurityArchitecture from "./pages/SecurityArchitecture";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inbox" element={<EmailListPage folder="inbox" title="Inbox" />} />
              <Route path="/sent" element={<EmailListPage folder="sent" title="Sent" />} />
              <Route path="/spam" element={<EmailListPage folder="spam" title="Spam" />} />
              <Route path="/trash" element={<EmailListPage folder="trash" title="Recycle Bin" />} />
              <Route path="/compose" element={<Compose />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/security-architecture" element={<SecurityArchitecture />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
