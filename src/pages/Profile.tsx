import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Calendar, ShieldCheck, LogOut, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdating(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="text-xl font-bold text-foreground mb-6">Profile & Security</h1>

      <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-foreground">
              {user?.fullName?.split(" ").map((n) => n[0]).join("") || "QU"}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{user?.fullName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground w-32">Full Name</span>
            <span className="text-sm text-foreground">{user?.fullName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground w-32">Email</span>
            <span className="text-sm text-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground w-32">Joined</span>
            <span className="text-sm text-foreground">
              {user?.createdAt ? format(new Date(user.createdAt), "PP") : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground w-32">Security</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-light text-accent">
              Active — Quantum-Safe
            </span>
          </div>
        </div>

        {/* Change Password Section */}
        {changingPassword && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 pt-4 border-t border-border"
          >
            <p className="text-sm font-medium text-foreground">Change Password</p>
            <Input
              type="password"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-secondary border-border"
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-secondary border-border"
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleChangePassword}
                disabled={updating}
                className="bg-gradient-primary text-accent-foreground font-semibold hover:opacity-90"
              >
                {updating ? "Updating..." : "Update Password"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setChangingPassword(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="border-border"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="border-border"
            onClick={() => setChangingPassword(!changingPassword)}
          >
            <Key className="w-4 h-4 mr-2" /> Change Password
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </motion.div>
  );
}