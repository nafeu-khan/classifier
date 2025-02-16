"use client";
import React, { useState } from "react";
import Link from "next/link";
import apiRequest from "@/../utils/api";
import Loader from "@/components/common/Loader";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation'; 

const SignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loader , setLoader] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  }); // To hold the error messages

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Your App"; // Safely accessing environment variable

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    // Username Validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Confirm Password Validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    const isFormValid = validateForm();
    if (isFormValid) {
      const data = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      }
      try {
        const response = await apiRequest(process.env.NEXT_PUBLIC_API_ENDPOINT_REGISTER, "POST", null, data); // Adjust the endpoint if needed
        console.log("API response:", response);
        if (response) {
          // Registration successful
          toast.success(response.message);
          router.push('/signin');
          // Perform any additional actions here
        }
  
      } catch (error) {
        if (error.response) {
          setErrors({
            ...errors,
            username: error.response.data.username,
            email: error.response.data.email,
            password: error.response.data.password,
            confirmPassword: error.response.data.confirmPassword
          })
      }
    }
    }
    setLoader(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    setErrors({
      ...errors,
      [name]: ""
    });
  };

  return (
    <>
    {
      loader && <Loader />
    }
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-lg p-8 space-y-8 bg-white shadow-lg rounded-lg border-2 dark:bg-gray-800 dark:border-gray-700 border-indigo-300">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Welcome to {appName}
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="name"
                name="username"
                required
                className={`w-full px-4 py-2 mt-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? "border-red-500" : ""
                }`}
                placeholder="Enter your name"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className={`w-full px-4 py-2 mt-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password and Confirm Password Fields */}
            <div className="w-full">
              {/* Password Input */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    className={`w-full px-4 py-2 mt-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-500"
                  >
                    {passwordVisible ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    )}
                  </span>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>
            </div>
            <div className="w-full">
              {/* Password Input */}
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    className={`w-full px-4 py-2 mt-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    placeholder="Enter your confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <span
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-500"
                  >
                    {confirmPasswordVisible ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    )}
                  </span>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-2 mt-4 text-white bg-primary hover:opacity-90 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?
              <Link href="/signin" className="text-blue-500 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp ;
