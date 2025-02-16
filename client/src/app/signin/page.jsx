"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import apiRequest from "../../../utils/api";
import Loader from "@/components/common/Loader";
import Cookie from "js-cookie";
import { fetchUserData } from "@/redux/userSlice";
import { useDispatch } from "react-redux";


const SignIn = () => {
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        username: "",
        password: "",
    });
    const [globalError , setGlobalError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setErrors({
            ...errors,
            [name]: "",
        });
        setGlobalError('');
    };

    const validateForm = () => {
        let formIsValid = true;
        const newErrors = { username: "", password: "" };

        if (!formData.username) {
            newErrors.username = "Username is required.";
            formIsValid = false;
        }
        if (!formData.password) {
            newErrors.password = "Password is required.";
            formIsValid = false;
        }

        setErrors(newErrors);
        return formIsValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);
        if (validateForm()) {
            console.log("Form submitted:", formData);
            const data = {
                username: formData.username,
                password: formData.password
              }
              try {
                const response = await apiRequest(process.env.NEXT_PUBLIC_API_ENDPOINT_LOGIN, "POST", null, data); // Adjust the endpoint if needed
                if (response) {
                  dispatch(fetchUserData({ token: response.access }));
                  toast.success(response.message);
                  Cookie.set('token', response.access);
                  Cookie.set('refresh', response.refresh);
                  router.push('/dashboard');
                }
          
              } catch (error) {
                if (error.response) {
                    setGlobalError(error.response.data.error);
                }
            }
        }
        setLoader(false);
    };

    return (
        <>
        {
            loader && <Loader />
        }
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg border-2 dark:bg-gray-800 dark:border-gray-700 border-2 border-indigo-300">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    Welcome to {process.env.NEXT_PUBLIC_APP_NAME}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 mt-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                        />
                        {errors.username && (
                            <p className="text-sm text-red-500">{errors.username}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="max-w-sm">
                        <label className="block text-sm mb-2">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={passwordVisible ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600"
                            >
                                {passwordVisible ? (
                                    <svg
                                        className="shrink-0 size-3.5"
                                        width="24"
                                        height="24"
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
                                        className="shrink-0 size-3.5"
                                        width="24"
                                        height="24"
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
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                        {
                            globalError && (
                                <p className="text-sm text-red-500">{globalError}</p>
                            )
                        }
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 hover:opacity-90 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Login
                    </button>
                </form>
                <div>
                    <p className="text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-blue-500 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    );
};

export default SignIn;
