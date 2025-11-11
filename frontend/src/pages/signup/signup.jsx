import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    mail: '',
    password: '',
    role: 'resident',
    colonyName: '',
    colony: '' // This will store the selected colony's ID
  });

  const [colonies, setColonies] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch the list of available colonies when the component loads
  useEffect(() => {
    const fetchColonies = async () => {
      try {
        const res = await axios.get('http://localhost:3551/api/auth/colonies');
        setColonies(res.data);
      } catch (err) {
        console.error('Error fetching colonies:', err);
        setError('Could not load the list of colonies. Please try again later.');
      }
    };
    fetchColonies();
  }, []); // The empty dependency array ensures this runs only once

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // Construct the data payload to send to the server
      const payload = {
        name: formData.name,
        mail: formData.mail,
        password: formData.password,
        role: formData.role,
      };

      // Conditionally add the colony name based on the user's role
      if (formData.role === 'president') {
        payload.colonyName = formData.colonyName;
      } else {
        // For residents, find the full colony object to get its name
        const selectedColony = colonies.find(c => c._id === formData.colony);
        if (!selectedColony) {
          setError('Please select a valid colony.');
          return;
        }
        payload.colonyName = selectedColony.name;
      }

      // ✅ The most important change is here:
      // Send the request with credentials to allow cookie handling
      const res = await axios.post('http://localhost:3551/api/auth/signup', payload, {
        withCredentials: true
      });

      // We no longer need to store the token or role in localStorage
      alert('Signup successful!');

      // Navigate to the correct dashboard based on the role from the server's response
      navigate(`/${res.data.role}/dashboard`);

    } catch (err) {
      // Display a user-friendly error message from the server response
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Create an Account</h2>
        {error && <p className="bg-red-500 text-white text-center p-3 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="mail"
            type="email"
            placeholder="Email Address"
            value={formData.mail}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="resident">I am a Resident</option>
            <option value="president">I am a President (Creating a new colony)</option>
          </select>

          {formData.role === 'president' && (
            <input
              name="colonyName"
              type="text"
              placeholder="Enter New Colony Name"
              value={formData.colonyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )}

          {formData.role === 'resident' && (
            <select
              name="colony"
              value={formData.colony}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">-- Select Your Colony --</option>
              {colonies.map((colony) => (
                <option key={colony._id} value={colony._id}>{colony.name}</option>
              ))}
            </select>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;