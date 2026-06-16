import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function ProfileModal({ isOpen, onClose, user, onShowAlert, onProfileUpdated }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      const meta = user.user_metadata || {};
      setName(meta.full_name || "");
      setPhone(meta.phone_number || "");
      
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (phone.length !== 10 || isNaN(phone)) {
      onShowAlert("Invalid Phone Number", "Please enter a valid 10-digit contact number.");
      setLoading(false);
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        onShowAlert("Password Mismatch", "Your new passwords do not match. Please try again.");
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        onShowAlert("Weak Password", "Your new password must be at least 6 characters long.");
        setLoading(false);
        return;
      }
    }

    const updatePayload = {
      data: { full_name: name, phone_number: phone }
    };

    if (newPassword) {
      updatePayload.password = newPassword;
    }

    const { data, error } = await supabase.auth.updateUser(updatePayload);

    setLoading(false);

    if (error) {
      onShowAlert("Update Failed", error.message);
    } else {
      onShowAlert("Profile Updated", "Your profile details have been successfully saved.");
      onProfileUpdated(data.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-4xl font-bold text-white shadow-emerald-500/25">
              E
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
        </div>

        {/* Added overflow-y-auto so smaller screens can scroll through the extra fields safely */}
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto px-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Account Email</label>
            <input value={user?.email || ""} disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Ashmi Hettige" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Contact Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="07XXXXXXXX" maxLength="10" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
          </div>

          {/* NEW: Optional Password Change Section */}
          <div className="border-t border-slate-200 pt-4 mt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Change Password (Optional)</p>
            <div className="space-y-3">
              <div>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="New Password" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                />
              </div>
              <div>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm New Password" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2 pb-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}