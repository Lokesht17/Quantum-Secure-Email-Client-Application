import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Quantum Secure Email" className="w-6 h-6 object-contain" />
        <h1 className="text-sm font-semibold text-foreground tracking-tight">
          Quantum Secure Email
        </h1>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-light text-accent border border-accent/20">
          E2E Encrypted
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-primary text-accent-foreground text-xs font-semibold">
                {user?.fullName?.split(" ").map((n) => n[0]).join("") || "QU"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="w-4 h-4 mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <Settings className="w-4 h-4 mr-2" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
