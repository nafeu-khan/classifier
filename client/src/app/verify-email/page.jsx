"use client";
import { useRouter , useSearchParams } from "next/navigation";
import { useEffect, useState  } from "react";
import apiRequest from "../../../utils/api";
import toast from "react-hot-toast";


export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  console.log(uid, token);
  

  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (uid && token) {
      const verifyEmail = async () => {
        try {
            const data = { uid : uid, token : token };
          const response = await apiRequest(process.env.NEXT_PUBLIC_API_ENDPOINT_VERIFY_EMAIL, "POST", null, data);
           if (response) {
            console.log(response)
            toast.success(response.message);
            router.push('/signin');
          }
        } catch (error) {
          if (error.response) {
            setStatus(error.response.data.error);
          }
        }
      };

      verifyEmail();
    } else {
      setStatus("Invalid or missing parameters.");
    }
  }, [uid, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-gray-800"></h1>
        <p className="mt-4 text-gray-600">{status}</p>
      </div>
    </div>
  );
}
