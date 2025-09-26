"use client";

import { useSelector } from "react-redux";
import { StoreTypes } from "../models/interfaces";
import LoadingSpinner from "./LoadingSpinner";

const LoadingOverlay: React.FC = () => {
  const isLoading = useSelector(
    (state: StoreTypes) => state.loadingSlice.isLoading
  );

  if (!isLoading) return null;

  return <LoadingSpinner />;
};

export default LoadingOverlay;
