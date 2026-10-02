import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import AuthLayout from "../../components/common/AuthLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      setIsSubmitting(false);
      setIsTransitioning(true);

      // Smooth dashboard transition animation
      setTimeout(() => {
        if (user.role === "PRESIDENT") {
          navigate("/president/dashboard");
        } else {
          navigate("/resident/dashboard");
        }
      }, 850);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setError("Invalid credentials");
    }
  };

  return (
    <AuthLayout
      titlePrefix="Welcome"
      highlightTitle="back."
      subheading="Let's keep your community moving forward."
      description="Sign in to report issues, track verified updates, and stay connected with what's happening in your community."
    >
      <div
        className={`w-full max-w-md bg-[#121212]/95 border border-[#292929] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 ${
          isTransitioning
            ? "animate-dashboard-transition border-[#B87333] shadow-[#B87333]/20"
            : "animate-auth-in"
        }`}
      >
        {/* Header Copy */}
        <div className="mb-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F2ED]">
            Welcome back.
          </h2>
          <p className="text-sm font-medium text-[#B87333] mt-1">
            Let's keep your community moving forward.
          </p>
          <p className="text-xs text-[#A8A29E] mt-1.5 leading-relaxed">
            Sign in to report issues, track updates, and stay connected with what's happening in your community.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium p-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Transition Indicator Animation */}
        {isTransitioning && (
          <div className="bg-[#B87333]/10 border border-[#B87333]/40 text-[#B87333] text-xs font-semibold p-3 rounded-lg mb-4 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            <span>Verified! Transitioning to your dashboard...</span>
          </div>
        )}

        {/* Preserved Form Fields: Stacked Vertically */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#66615D] absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting || isTransitioning}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#1A1A1A] border border-[#292929] text-[#F5F2ED] placeholder-[#66615D] text-sm focus:outline-none focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333] transition disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#66615D] absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting || isTransitioning}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#1A1A1A] border border-[#292929] text-[#F5F2ED] placeholder-[#66615D] text-sm focus:outline-none focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333] transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Primary Authentication Button in Copper Accent */}
          <button
            type="submit"
            disabled={isSubmitting || isTransitioning}
            className="w-full mt-2 bg-[#B87333] hover:bg-[#C98545] disabled:bg-[#8F5A2B] text-[#080808] font-bold py-2.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[#B87333]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 text-[#080808] animate-spin" />
                <span>Signing In...</span>
              </>
            ) : isTransitioning ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#080808]" />
                <span>Opening Dashboard...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4 text-[#080808]" />
              </>
            )}
          </button>
        </form>

        {/* Preserved Navigation Link */}
        <div className="mt-4 pt-4 border-t border-[#292929] text-center">
          <p className="text-xs text-[#A8A29E]">
            New here?{" "}
            <Link
              to="/signup"
              className="text-[#B87333] hover:text-[#C98545] hover:underline font-semibold transition"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
