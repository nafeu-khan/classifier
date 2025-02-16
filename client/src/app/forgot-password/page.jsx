"use client";
import React , { useState } from 'react';
import apiRequest from '../../../utils/api';
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import Loader from '@/components/common/Loader';


export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let formIsValid = true;
    let errorMessage = '';
    if (!email) {
      errorMessage = 'Email is required.';
      formIsValid = false;
    }
    return formIsValid;
  };
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (validateForm()) {
        console.log("Form submitted:", email);
        const data = {
          email: email,
          }
          try {
            const response = await apiRequest(process.env.NEXT_PUBLIC_API_ENDPOINT_FORGOT_PASSWORD, "POST", null, data); // Adjust the endpoint if needed
            console.log("API response:", response);
            if (response) {
              console.log(response)
              toast.success(response.message);    
            }
      
          } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.detail);
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
      <main id="content" role="main" className="flex items-center justify-center w-full h-screen max-w-lg mx-auto p-6">
        <div className="mt-7 bg-white w-full rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 border-2 border-indigo-300">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">Forgot password?</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Remember your password?
                <a className="text-blue-600 decoration-2 hover:underline font-medium" href="/signin">
                  Login here
                </a>
              </p>
            </div>

            <div className="mt-5">
              <form  onSubmit={handleSubmit}>
                <div className="grid gap-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold ml-1 mb-2 dark:text-white">Email address</label>
                    <div className="relative">
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />    
                     {
                      errorMessage && <p className="text-xs text-red-600 mt-2">{errorMessage}</p>
                     }            
                </div>
                    <p className="hidden text-xs text-red-600 mt-2" id="email-error">Please include a valid email address so we can get back to you</p>
                  </div>
                  <button type="submit" className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800">Reset password</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
