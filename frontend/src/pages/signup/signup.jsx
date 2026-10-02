import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  Home,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Loader2
} from "lucide-react";
import AuthLayout from "../../components/common/AuthLayout";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    houseNo: "",
    ownerName: "",
    role: "PRESIDENT",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[e.target.name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation checks
    const errors = {};
    if (formData.name.trim().length < 3) {
      errors.name = "Full name must be at least 3 characters.";
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required.";
    }
    if (formData.role === "RESIDENT") {
      if (!formData.communityId) {
        errors.communityId = "Please select a community.";
      }
      if (!formData.houseNo.trim()) {
        errors.houseNo = "House/flat number is required.";
      }
      if (!formData.ownerName.trim()) {
        errors.ownerName = "Owner name is required.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError("");
    setIsSubmitting(true);

    try {
      const user = await signup(formData);
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
      const errMsg = err.message || "Signup failed";

      if (errMsg.toLowerCase().includes("email")) {
        setFieldErrors({ email: "Email is already registered." });
      } else if (errMsg.toLowerCase().includes("password")) {
        setFieldErrors({ password: "Password must be at least 6 characters." });
      } else if (errMsg.toLowerCase().includes("name")) {
        setFieldErrors({ name: "Name must be at least 3 characters." });
      } else {
        setError(errMsg);
      }
    }
  };

  // Fetch communities for dropdown
  const [communities, setCommunities] = useState([]);

  React.useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await import("axios").then((m) =>
          m.default.get(
            "https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1/communities/public"
          )
        );
        setCommunities(res.data);
      } catch (err) {
        console.error("Failed to load communities", err);
      }
    };
    fetchCommunities();
  }, []);

  return (
    <AuthLayout
      titlePrefix="Join"
      highlightTitle="Community Desk."
      subheading="Your community. Your voice. Your impact."
      description="Create your account to report local issues, follow their progress, and help build a better community together."
      peopleVisibilityBoost={true}
    >
      <div
        className={`w-full max-w-md bg-[#121212]/95 border border-[#292929] rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 ${
          isTransitioning
            ? "animate-dashboard-transition border-[#B87333] shadow-[#B87333]/20"
            : "animate-auth-in"
        }`}
      >
        {/* Header Copy */}
        <div className="mb-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F2ED]">
            Create your account
          </h2>
          <p className="text-xs text-[#A8A29E] mt-0.5 leading-relaxed">
            Connect with your neighborhood and track real community progress.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium p-2 rounded-lg mb-2">
            {error}
          </div>
        )}

        {/* Transition Indicator Animation */}
        {isTransitioning && (
          <div className="bg-[#B87333]/10 border border-[#B87333]/40 text-[#B87333] text-xs font-semibold p-2.5 rounded-lg mb-2.5 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            <span>Account created! Transitioning to your dashboard...</span>
          </div>
        )}

        {/* Form Fields: Strictly Stacked One After Other (Single Column) */}
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* 1. Full Name */}
          <div>
            <label className="block text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#66615D] absolute left-2.5 top-2.5" />
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
                disabled={isSubmitting || isTransitioning}
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1A1A1A] border text-[#F5F2ED] placeholder-[#66615D] text-xs focus:outline-none transition disabled:opacity-50 ${
                  fieldErrors.name
                    ? "border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
                    : "border-[#292929] focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]"
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-0.5 text-[10px] text-[#EF4444] font-medium">{fieldErrors.name}</p>
            )}
          </div>

          {/* 2. Email Address */}
          <div>
            <label className="block text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#66615D] absolute left-2.5 top-2.5" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                required
                disabled={isSubmitting || isTransitioning}
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1A1A1A] border text-[#F5F2ED] placeholder-[#66615D] text-xs focus:outline-none transition disabled:opacity-50 ${
                  fieldErrors.email
                    ? "border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
                    : "border-[#292929] focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-0.5 text-[10px] text-[#EF4444] font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* 3. Password */}
          <div>
            <label className="block text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#66615D] absolute left-2.5 top-2.5" />
              <input
                name="password"
                type="password"
                placeholder="Password (at least 6 characters)"
                onChange={handleChange}
                required
                disabled={isSubmitting || isTransitioning}
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1A1A1A] border text-[#F5F2ED] placeholder-[#66615D] text-xs focus:outline-none transition disabled:opacity-50 ${
                  fieldErrors.password
                    ? "border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
                    : "border-[#292929] focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]"
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-0.5 text-[10px] text-[#EF4444] font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* 4. Phone Number */}
          <div>
            <label className="block text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[#66615D] absolute left-2.5 top-2.5" />
              <input
                name="phoneNumber"
                placeholder="Phone Number"
                onChange={handleChange}
                required
                disabled={isSubmitting || isTransitioning}
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1A1A1A] border text-[#F5F2ED] placeholder-[#66615D] text-xs focus:outline-none transition disabled:opacity-50 ${
                  fieldErrors.phoneNumber
                    ? "border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
                    : "border-[#292929] focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]"
                }`}
              />
            </div>
            {fieldErrors.phoneNumber && (
              <p className="mt-0.5 text-[10px] text-[#EF4444] font-medium">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          {/* 5. Role Selection */}
          <div>
            <label className="block text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
              I am a:
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting || isTransitioning}
              className="w-full px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#292929] text-[#F5F2ED] text-xs focus:outline-none focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333] transition disabled:opacity-50"
            >
              <option value="PRESIDENT" className="bg-[#1A1A1A] text-[#F5F2ED]">
                President (Admin)
              </option>
              <option value="RESIDENT" className="bg-[#1A1A1A] text-[#F5F2ED]">
                Resident
              </option>
            </select>
          </div>

          {/* 6. Conditional Resident Fields: Stacked strictly one after another */}
          {formData.role === "RESIDENT" && (
            <>
              <div>
                <label className="block text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
                  Select Community:
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-[#66615D] absolute left-2.5 top-2.5" />
                  <select
                    name="communityId"
                    value={formData.communityId || ""}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || isTransitioning}
                    className={`w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1A1A1A] border text-[#F5F2ED] text-xs focus:outline-none transition disabled:opacity-50 ${
                      fieldErrors.communityId
                        ? "border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
                        : "border-[#292929] focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]"
                    }`}
                  >
                    <option value="" disabled className="bg-[#1A1A1A] text-[#66615D]">
                      -- Choose a Community --
                    </option>
                    {communities.map((c) => (
                      <option key={c._id} value={c._id} className="bg-[#1A1A1A] text-[#F5F2ED]">
                        {c.name} {c.location?.city ? `(${c.location.city})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.communityId && (
                  <p className="mt-0.5 text-[10px] text-[#EF4444] font-medium">{fieldErrors.communityId}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
                  House/Flat No:
                </label>
                <div className="relative">
                  <Home className="w-3.5 h-3.5 text-[#66615D] absolute left-2.5 top-2.5" />
                  <input
                    name="houseNo"
                    placeholder="e.g., A-101"
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || isTransitioning}
                    className={`w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1A1A1A] border text-[#F5F2ED] placeholder-[#66615D] text-xs focus:outline-none transition disabled:opacity-50 ${
                      fieldErrors.houseNo
                        ? "border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
                        : "border-[#292929] focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]"
                    }`}
                  />
                </div>
                {fieldErrors.houseNo && (
                  <p className="mt-0.5 text-[10px] text-[#EF4444] font-medium">{fieldErrors.houseNo}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
                  Owner Name:
                </label>
                <div className="relative">
                  <UserCheck className="w-3.5 h-3.5 text-[#66615D] absolute left-2.5 top-2.5" />
                  <input
                    name="ownerName"
                    placeholder="Property Owner"
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || isTransitioning}
                    className={`w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1A1A1A] border text-[#F5F2ED] placeholder-[#66615D] text-xs focus:outline-none transition disabled:opacity-50 ${
                      fieldErrors.ownerName
                        ? "border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
                        : "border-[#292929] focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]"
                    }`}
                  />
                </div>
                {fieldErrors.ownerName && (
                  <p className="mt-0.5 text-[10px] text-[#EF4444] font-medium">{fieldErrors.ownerName}</p>
                )}
              </div>
            </>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || isTransitioning}
            className="w-full mt-2.5 bg-[#B87333] hover:bg-[#C98545] disabled:bg-[#8F5A2B] text-[#080808] font-bold py-2 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[#B87333] text-xs sm:text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-[#080808] animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : isTransitioning ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#080808]" />
                <span>Opening Dashboard...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#080808]" />
              </>
            )}
          </button>
        </form>

        {/* Preserved Navigation Link */}
        <div className="mt-2 pt-2 border-t border-[#292929] text-center">
          <p className="text-xs text-[#A8A29E]">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-[#B87333] hover:text-[#C98545] hover:underline font-semibold transition"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;
