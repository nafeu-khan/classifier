"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiRequest from '../../../utils/api';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
// import apiRequest from '../../../utils/api';

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const uuid = searchParams.get('uid');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const checkToken = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(process.env.NEXT_PUBLIC_API_ENDPOINT_CHECK_TOKEN, "POST", null, { token: token, id: uuid });
      if (response) {
        console.log(response)
        toast.success(response.message);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.error);
        router.push('/forgot-password');
      }
    }
    setIsLoading(false);
  }


  useEffect(() => {
    checkToken();
  }, []);


  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({ password: "", confirmPassword: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const validateForm = () => {
    let formIsValid = true;
    if (!formData.password) {
      formIsValid = false;
      setFormErrors({ ...formErrors, password: "Password is required" });
    } else if (formData.password.length < 6) {
      formIsValid = false;
      setFormErrors({ ...formErrors, password: "Password must be at least 6 characters long" });
    }
    if (!formData.confirmPassword) {
      formIsValid = false;
      setFormErrors({ ...formErrors, confirmPassword: "Please confirm your password" });
    } else if (formData.password !== formData.confirmPassword) {
      formIsValid = false;
      setFormErrors({ ...formErrors, confirmPassword: "Passwords do not match" });
    }
    if (formData.password !== formData.confirmPassword) {
      formIsValid = false;
      setFormErrors({ ...formErrors, confirmPassword: "Passwords do not match" });
    }
    return formIsValid;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setFormErrors({
      ...formErrors,
      [name]: "",
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (validateForm()) {
      const data = {
        token: token,
        uid: uuid,
        new_password: formData.password
      }
      try {
        const response = await apiRequest(process.env.NEXT_PUBLIC_API_ENDPOINT_RESET_PASSWORD, "POST", null, data); // Adjust the endpoint if needed
        console.log("API response:", response);
        if (response) {
          console.log(response)
          toast.success(response.message);
          router.push('/signin');
        }

      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.error);
        }
      }
    }
    setIsLoading(false);
  };
  return (
    <>
    {
      isLoading && (
        <Loader />
      )
    }
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-lg p-8 space-y-8 bg-white shadow-lg rounded-lg border-2 dark:bg-gray-800 dark:border-gray-700 border-2 border-indigo-300">
          <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Password Input */}
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
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
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
                {
                  formErrors.password && (
                    <p className="text-red-500 text-xs italic">{formErrors.password}</p>
                  )
                }
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
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
                {
                  formErrors.confirmPassword && (
                    <p className="text-red-500 text-xs italic">{formErrors.confirmPassword}</p>
                  )
                }
              </div>
            </div>


            {/* Login Button */}
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset Password
            </button>
          </form>

        </div>
      </div>
    </>
  );
}
