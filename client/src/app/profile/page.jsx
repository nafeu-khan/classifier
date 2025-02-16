"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import apiRequest from "../../../utils/api";
import { getToken } from "../../../utils/auth";
import { fetchUserData } from "@/redux/userSlice";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userInfo);

  const [userState, setUserState] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    profile_picture: user?.profile_picture || "",
    address: user?.address || "",
  });

  const [isEditing, setIsEditing] = useState({
    first_name: false,
    last_name: false,
    bio: false,
    phone_number: false,
    address: false,
    profile_picture: false,
  });

  useEffect(() => {
    if (user) {
      setUserState({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        profile_picture: user.profile_picture
          ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${user.profile_picture}`
          : "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setUserState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleApiCall = async () => {
    try {
      const token = getToken();
      const formData = new FormData();
      Object.keys(userState).forEach((key) => {
        formData.append(key, userState[key]);
      });

      const response = await apiRequest(
        process.env.NEXT_PUBLIC_API_ENDPOINT_USER,
        "PUT",
        token,
        formData
      );

      dispatch(fetchUserData({ token }));
    } catch (error) {
      console.error("Error during API call:", error);
      alert("Failed to update user data.");
    }
  };

  const handleFieldBlur = async (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    await handleApiCall();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const previewURL = URL.createObjectURL(file);
        setUserState((prevState) => ({
          ...prevState,
          profile_picture: previewURL,
        }));
        const formData = new FormData();
        formData.append("profile_picture", file);
        const token = getToken();
        await apiRequest(
          process.env.NEXT_PUBLIC_API_ENDPOINT_USER,
          "PUT",
          token,
          formData
        );
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("Failed to update profile picture.");
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-pink-200 min-h-screen flex items-center justify-center">
        <div className="w-3/4 mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <Image
                src={userState.profile_picture}
                alt="Profile"
                className="rounded-full object-cover border-4 border-primary"
                fill
              />
              <label
                htmlFor="profile"
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600"
              >
                <input
                  type="file"
                  id="profile"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
                Edit
              </label>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditing.first_name || isEditing.last_name ? (
                <input
                  type="text"
                  value={`${userState.first_name} ${userState.last_name}`}
                  onChange={(e) => {
                    const [firstName, ...lastName] = e.target.value.split(" ");
                    handleInputChange("first_name", firstName);
                    handleInputChange("last_name", lastName.join(" "));
                  }}
                  onBlur={() => {
                    setIsEditing((prev) => ({
                      ...prev,
                      first_name: false,
                      last_name: false,
                    }));
                    handleApiCall();
                  }}
                  autoFocus
                  className="border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <>
                  {userState.first_name} {userState.last_name}
                  <button
                    className="ml-2 text-blue-500 hover:underline"
                    onClick={() =>
                      setIsEditing((prev) => ({
                        ...prev,
                        first_name: true,
                        last_name: true,
                      }))
                    }
                  >
                    Edit
                  </button>
                </>
              )}
            </h1>
            <p className="mt-2 text-gray-600">
              {isEditing.bio ? (
                <textarea
                  value={userState.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  onBlur={() => handleFieldBlur("bio")}
                  rows="3"
                  className="w-full border rounded-lg p-2"
                />
              ) : (
                <>
                  {userState.bio || "No bio available"}
                  <button
                    className="ml-2 text-blue-500 hover:underline"
                    onClick={() =>
                      setIsEditing((prev) => ({ ...prev, bio: true }))
                    }
                  >
                    Edit
                  </button>
                </>
              )}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-gray-700">Email</h3>
              <p className="text-gray-600">{userState.email}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Phone</h3>
              {isEditing.phone_number ? (
                <input
                  type="text"
                  value={userState.phone_number}
                  onChange={(e) =>
                    handleInputChange("phone_number", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("phone_number")}
                  className="border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <>
                  {userState.phone_number}
                  <button
                    className="ml-2 text-blue-500 hover:underline"
                    onClick={() =>
                      setIsEditing((prev) => ({
                        ...prev,
                        phone_number: true,
                      }))
                    }
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-gray-700">Address</h3>
            {isEditing.address ? (
              <textarea
                value={userState.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                onBlur={() => handleFieldBlur("address")}
                rows="2"
                className="w-full border rounded-lg p-2"
              />
            ) : (
              <>
                {userState.address || "No address provided"}
                <button
                  className="ml-2 text-blue-500 hover:underline"
                  onClick={() =>
                    setIsEditing((prev) => ({ ...prev, address: true }))
                  }
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
