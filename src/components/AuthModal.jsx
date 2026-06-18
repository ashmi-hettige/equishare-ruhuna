import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function AuthModal({ isOpen, onClose, onShowAlert }) {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setPhone("");
      setIsSignUp(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalEmail = `${username.toLowerCase()}@engug.ruh.ac.lk`;

    if (isSignUp) {
      if (password !== confirmPassword) {
        onShowAlert("Password Mismatch", "Your passwords do not match. Please try again.");
        setLoading(false);
        return;
      }
      if (phone.length !== 10 || isNaN(phone)) {
        onShowAlert("Invalid Phone", "Please enter a valid 10-digit contact number.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({ 
        email: finalEmail, 
        password,
        options: { data: { full_name: name, phone_number: phone } }
      });
      
      if (error) {
        onShowAlert("Sign Up Failed", error.message);
      } else {
        onShowAlert("Success", "Welcome to EquiShare Ruhuna! You are now logged in.");
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: finalEmail, password });
      if (error) {
        onShowAlert("Login Failed", "Invalid credentials. Please try again.");
      } else {
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-5xl font-bold text-white shadow-emerald-500/25">
          E
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 text-center w-full">
            {isSignUp ? "Join EquiShare" : "Welcome Back"}
          </h2>
          <button onClick={onClose} className="absolute right-6 text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ashmi Hettige"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Contact Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="07XXXXXXXX"
                  maxLength="10"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">University Email</label>
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value.split('@')[0].replace(/\s+/g, ''))} 
                required 
                placeholder="eg255648" 
                className="w-full px-4 py-2.5 text-sm outline-none" 
              />
              <div className="bg-slate-50 border-l border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-500 pointer-events-none whitespace-nowrap">
                @engug.ruh.ac.lk
              </div>
            </div>
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 mt-2"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          {isSignUp ? "Already have an account? " : "New to EquiShare? "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-emerald-600 hover:underline"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}