import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
// import axios from "axios"; // Unused now

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
  const { signup } = useAuth(); // Use context
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
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
      errors.name = 'Full name must be at least 3 characters.';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
    }
    if (formData.role === 'RESIDENT') {
      if (!formData.communityId) {
        errors.communityId = 'Please select a community.';
      }
      if (!formData.houseNo.trim()) {
        errors.houseNo = 'House/flat number is required.';
      }
      if (!formData.ownerName.trim()) {
        errors.ownerName = 'Owner name is required.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError("");

    try {
      // Use AuthContext signup method
      const user = await signup(formData); // This now auto-logs them in

      // Navigate based on role directly to dashboard
      if (user.role === "PRESIDENT") {
        navigate("/president/dashboard");
      } else {
        navigate("/resident/dashboard");
      }

    } catch (err) {
      console.error(err);
      const errMsg = err.message || "Signup failed";
      
      // Map server validation / duplicate errors
      if (errMsg.toLowerCase().includes('email')) {
        setFieldErrors({ email: 'Email address is already registered.' });
      } else if (errMsg.toLowerCase().includes('password')) {
        setFieldErrors({ password: 'Password must be at least 6 characters.' });
      } else if (errMsg.toLowerCase().includes('name')) {
        setFieldErrors({ name: 'Full name must be at least 3 characters.' });
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
        const res = await import("axios").then(m => m.default.get("http://localhost:3551/api/v1/communities/public"));
        setCommunities(res.data);
      } catch (err) {
        console.error("Failed to load communities", err);
      }
    };
    fetchCommunities();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Join Community Hub</h2>
        {error && <p className="bg-red-500 text-white text-center p-2 rounded mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                fieldErrors.name ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                fieldErrors.email ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                fieldErrors.password ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                fieldErrors.phoneNumber ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {fieldErrors.phoneNumber && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          <div className="py-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
              >
                <option value="RESIDENT">Resident</option>
                <option value="PRESIDENT">President (Admin)</option>
              </select>
            </div>

            {formData.role === "RESIDENT" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Community:</label>
                  <select
                    name="communityId"
                    value={formData.communityId || ""}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                      fieldErrors.communityId ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                    }`}
                  >
                    <option value="" disabled>-- Choose a Community --</option>
                    {communities.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.location?.city ? `(${c.location.city})` : ''}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.communityId && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.communityId}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">House/Flat No:</label>
                    <input
                      name="houseNo"
                      placeholder="e.g., A-101"
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                        fieldErrors.houseNo ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {fieldErrors.houseNo && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.houseNo}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Owner Name:</label>
                    <input
                      name="ownerName"
                      placeholder="Property Owner"
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                        fieldErrors.ownerName ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {fieldErrors.ownerName && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.ownerName}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md transition"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account? <Link to="/" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;    