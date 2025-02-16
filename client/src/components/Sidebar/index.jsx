"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import apiRequest from "../../../utils/api";
import { getToken, isLoggedIn } from "../../../utils/auth";
import FileUpload from "../UploadFile/FileUpload";
import { useDispatch, useSelector } from "react-redux";
import { addImage, fetchImages } from "@/redux/imageSlice";
import { deleteProject, DeleteSubProject, fetchAllMenu } from "@/redux/allMenuSlice";
import CommonModel from "../Dashboard/Model/CreateProjectModel";
import { fetchUserData } from "@/redux/userSlice";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import EditProjectModal from "../Dashboard/Model/EditProjectModal";
import Swal from "sweetalert2";
import UploadZipFile from "../UploadFile/UploadZipFile";
import { useSearchParams } from "next/navigation";
import EditSubProjectModal from "../Dashboard/Model/EditSubProjectModal";
import UploadAnnotation from "../UploadFile/UploadAnnotation";


const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId"); // Access the projectId from query params
  const subprojectId = searchParams.get("subprojectId"); // Access the subprojectId from query params
  const [openItem, setOpenItem] = useState(null);
  const [openSubProject, setOpenSubProject] = useState(null); // State for Sub Project toggle
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProject, setIsEditProject] = useState(false);
  const [isUploadZip, setIsUploadZip] = useState(false);
  const [editProjectData, setEditProjectData] = useState(null);
  const [editSubProjectData, setEditSubProjectData] = useState(null);
  const [isPredict, setIsPredict] = useState(false);
  const [isEditSubProject, setIsEditSubProject] = useState(false);
  const token = getToken();
  const searchQuery = useSelector((state) => state.search.searchQuery);
  const dispatch = useDispatch();
  const menuGroups = useSelector((state) => state.allMenu.menuGroups);
  const images = useSelector((state) => state.image.selectedImage);
  const [isUploadAnnotation, setIsUploadAnnotation] = useState(false);

  useEffect(() => {
    dispatch(fetchUserData({ token }));
    dispatch(fetchAllMenu({ token }));
    if (!isLoggedIn()) {
      router.push("/signin");
    }
  }, [dispatch, projectId, subprojectId]);

  useEffect(() => {

    if (projectId && !subprojectId) {
      const all_image = menuGroups.find((item) => item.id === parseInt(projectId));
      if (all_image) {
        dispatch(addImage(all_image.images));
      }
    }

    if (projectId && subprojectId) {
      const all_image = menuGroups.find((item) => item.id === parseInt(projectId));
      if (all_image) {
        const subproject = all_image.subprojects.find((sub) => sub.id === parseInt(subprojectId));
        if (subproject) {
          dispatch(addImage(subproject.images));
        } else {
          console.warn("Subproject not found for subprojectId:", subprojectId);
        }
      }
    }
  }, [projectId, subprojectId, dispatch, menuGroups]);




  const handleToggle = (id) => {
    const all_image = menuGroups.find((item) => item.id === id);
    if (all_image) {
      dispatch(addImage(all_image.images))
    }
  };

  const handleOpenToggle = (id) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  const handleSubProjectToggle = (projectId, subprojectId) => {
    setOpenSubProject((prev) => (prev === projectId ? null : projectId));

    const project = menuGroups.find((item) => item.id === projectId);

    if (project) {
      const subproject = project.subprojects.find((sub) => sub.id === subprojectId);

      if (subproject) {
        // Extract the images from the subproject
        const subprojectImages = subproject.images;
        dispatch(addImage(subprojectImages))
      }
    }

  };
  const handleProjectCreate = () => {
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditProjectData(project);
    setIsEditProject(true);
  };

  const handleDeleteProject = (project) => {
    Swal.fire({
      title: `<span style="font-size: 1.5rem; font-weight: bold;">Are you sure to delete this project?</span>`,
      html: `<p style="font-size: 1.2rem; color: #555;">Project Name : <strong>${project.name}</strong></p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `<span style="font-size: 1rem;">Yes, delete it!</span>`,
      cancelButtonText: `<span style="font-size: 1rem;">Cancel</span>`,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProject({ token, id: project.id }));
      }
    });
  };

  const handleEditSubProject = ({ menuGroup, subProject }) => {
    setEditSubProjectData(subProject);
    setIsEditSubProject(true);
  };

  const handleUploadAnnotation = () => {
    setIsUploadAnnotation(true);
  };

  const handleDeleteSubProject = ({ menuGroup, subProject }) => {
    console.log(menuGroup, subProject);
    dispatch(DeleteSubProject({ projectId: menuGroup.id, subProjectId: subProject.id, token }))
    // Swal.fire({
    //   title: `<span style="font-size: 1.5rem; font-weight: bold;">Are you sure to delete this subproject?</span>`,
    //   html: `<p style="font-size: 1.2rem; color: #555;">Subproject Name : <strong>${subProject.name}</strong></p>`,
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: `<span style="font-size: 1rem;">Yes, delete it!</span>`,
    //   cancelButtonText: `<span style="font-size: 1rem;">Cancel</span>`,
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     dispatch(deleteSubProject({ token, id: subProject.id }));
    //   }
    // });
  };


  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <CommonModel isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      <EditProjectModal editProjectData={editProjectData} token={token} isEditProject={isEditProject} setIsEditProject={setIsEditProject} />
      <EditSubProjectModal projectId={projectId} editSubProjectData={editSubProjectData} token={token} isEditSubProject={isEditSubProject} setIsEditSubProject={setIsEditSubProject} />
      <aside
        className={`fixed z-40 left-0 top-0 flex h-screen w-72.5 flex-col overflow-y-hidden bg-gray-800 duration-300 ease-linear lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-5.5">
          <Link href="/" className="flex items-center">
            <h1 className="ml-2 text-2xl font-semibold text-white cursor-pointer">
              {process.env.NEXT_PUBLIC_APP_NAME}
            </h1>
          </Link>
        </div>

        <div className="no-scrollbar flex flex-col overflow-y-auto">
          {menuGroups.map((menuGroup) => (
            <div
              key={menuGroup.id}
              className="border border-primary gap-2 my-1 mx-2 rounded-t-lg"
            >
              <button
                className={`flex items-center justify-between w-full p-2 text-left text-white rounded-t-lg hover:bg-gray-600 transition-all duration-900 ease-in-out ${openItem === menuGroup.id ? "bg-gray-600" : "bg-gray-800"
                  }`}
              >
                <Link href={`/dashboard?projectId=${menuGroup.id}`} className="hover:cursor-pointer hover:underline " onClick={() => handleToggle(menuGroup.id)}>{menuGroup.name}</Link>

                <div className="flex items-center gap-2">
                  <MdDeleteForever className="hover:cursor-pointer hover:text-red-500" onClick={() => handleDeleteProject(menuGroup)} />
                  <FaEdit className="hover:cursor-pointer hover:text-blue-900" onClick={() => handleEditProject(menuGroup)} />

                  <svg onClick={() => handleOpenToggle(menuGroup.id)}
                    className={`h-5 w-5 transform transition-transform duration-300 ${openItem === menuGroup.id ? "rotate-0" : "rotate-180"
                      }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 15l7-7 7 7" />
                  </svg>
                </div>

              </button>
              {openItem === menuGroup.id && (
                <div className="overflow-hidden transition-[max-height] duration-300 ease-in-out bg-gray-700 px-6 py-4 text-sm text-white">
                  <FileUpload id={menuGroup.id} token={token} />
                </div>
              )}
              {openItem === menuGroup.id && (
                <div className="overflow-hidden transition-[max-height] duration-300 ease-in-out bg-gray-700 px-6 py-4 text-sm text-white">
                  <button
                    className="border border-primary gap-2 py-1 mb-1 px-2 rounded"
                    onClick={() => setIsUploadZip(!isUploadZip)}
                  >
                    Upload Zip
                  </button>
                  <button
                    className="border border-primary gap-2 py-1 mb-1 px-2 rounded"
                    onClick={() => setIsUploadAnnotation(!isUploadAnnotation)}
                  >
                    Upload Annotation
                  </button>
                  <UploadZipFile
                    token={token}
                    id={menuGroup.id}
                    isUploadZip={isUploadZip}
                    setIsUploadZip={setIsUploadZip}
                  />
                  <UploadAnnotation
                    token={token}
                    id={menuGroup.id}
                    isUploadAnnotation={isUploadAnnotation}
                    setIsUploadAnnotation={setIsUploadAnnotation}
                  />
                </div>
              )}
              {
                menuGroup?.subprojects && menuGroup?.subprojects?.length > 0 && (
                  <button
                    onClick={() => handleSubProjectToggle(menuGroup.id)}
                    className={`flex items-center justify-between w-full p-2 text-left text-white hover:bg-gray-600 transition-all duration-900 ease-in-out ${openSubProject === menuGroup.id ? "bg-gray-600" : "bg-gray-800"
                      }`}
                  >
                    <span className="text-sm">Sub Project</span>
                    <svg
                      className={`h-5 w-5 transform transition-transform duration-300 ${openSubProject === menuGroup.id ? "rotate-0" : "rotate-180"
                        }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                )
              }


              {openSubProject === menuGroup.id && (
                <ul className="bg-gray-700 text-sm text-white">
                  {
                    /* Add more project items as needed */
                    menuGroup.subprojects?.map((subProject) => (
                      <li
                        key={subProject.id}
                        className="py-1 hover:bg-gray-600 px-6 cursor-pointer flex items-center justify-between"
                      >
                        <Link onClick={() => handleSubProjectToggle(menuGroup.id, subProject.id)} href={`/dashboard?projectId=${menuGroup.id}&subprojectId=${subProject.id}`} className="hover:cursor-pointer hover:underline">{subProject.name}</Link>
                        <div className="flex items-center gap-2">
                          <MdDeleteForever className="hover:cursor-pointer hover:text-red-500" onClick={() => handleDeleteSubProject({ menuGroup, subProject })} />
                          <FaEdit className="hover:cursor-pointer hover:text-blue-900" onClick={() => handleEditSubProject({ menuGroup, subProject })} />
                        </div>
                      </li>
                    ))
                  }
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={handleProjectCreate}
            className="bg-teal-600 p-1 rounded-md text-white hover:bg-teal-500 mb-2 absolute w-full bottom-2 z-0"
          >
            Create New Project
          </button>
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
