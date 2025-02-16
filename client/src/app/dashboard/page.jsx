"use client";
import ImageFilter from "@/components/Dashboard/ImageFilter";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getToken } from "../../../utils/auth";
import { fetchImages } from "@/redux/imageSlice";

export default function Home() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId"); // Access the projectId from query params
  const subprojectId = searchParams.get("subprojectId"); // Access the subprojectId from query params  


  return (
    <DefaultLayout>
      <ImageFilter projectId={projectId} subprojectId={subprojectId} />
    </DefaultLayout>
  );
}
