'use client'
import React, { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import Navbar from "../components/navbar";
import styles from "../styles/uploadDoc.module.css";

// Dynamically import components that use window/document with no SSR
const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <input type="text" className={styles.datePicker} disabled />
  }
);

const Select = dynamic(
  () => import("react-select").then((mod) => mod.default),
  { ssr: false }
);

const CreatableSelect = dynamic(
  () => import("react-select/creatable").then((mod) => mod.default),
  { ssr: false }
);

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

const majorHeadOptions = [
  { value: "Personal", label: "Personal" },
  { value: "Professional", label: "Professional" },
];

const minorHeadOptions = {
  Personal: [
    { value: "John", label: "John" },
    { value: "Tom", label: "Tom" },
    { value: "Emily", label: "Emily" },
  ],
  Professional: [
    { value: "Accounts", label: "Accounts" },
    { value: "HR", label: "HR" },
    { value: "IT", label: "IT" },
    { value: "Finance", label: "Finance" },
  ],
};

const FileUpload = () => {
  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [majorHead, setMajorHead] = useState(null);
  const [minorHead, setMinorHead] = useState(null);
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch available tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const mockTags = [
          { value: "RMC", label: "RMC" },
          { value: "2024", label: "2024" },
          { value: "work_order", label: "Work Order" },
        ];
        setAvailableTags(mockTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setUploadStatus({
          message: "Failed to load tags. Please refresh the page.",
          type: "error",
        });
      }
    };

    fetchTags();
  }, []);

  // Reset minor head when major head changes
  useEffect(() => {
    setMinorHead(null);
  }, [majorHead]);

  // Handle file selection with validation
  const handleFileChange = useCallback((e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setUploadStatus({
        message: "No file selected",
        type: "error",
      });
      return;
    }

    const file = e.target.files[0];

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadStatus({
        message: "Only image (JPEG, PNG, GIF) and PDF files are allowed",
        type: "error",
      });
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadStatus({
        message: "File size exceeds 10MB limit",
        type: "error",
      });
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setUploadStatus({
      message: `${file.name} selected (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      type: "success",
    });
  }, []);

  // Validate form before submission
  const validateForm = useCallback(() => {
    if (!selectedFile) {
      setUploadStatus({
        message: "Please select a file to upload",
        type: "error",
      });
      return false;
    }

    if (!majorHead || !minorHead) {
      setUploadStatus({
        message: "Please select both category and sub-category",
        type: "error",
      });
      return false;
    }

    return true;
  }, [selectedFile, majorHead, minorHead]);

  // Prepare form data for API submission
  const prepareFormData = useCallback(() => {
    return {
      major_head: majorHead?.value || null,
      minor_head: minorHead?.value || null,
      document_date: selectedDate.toISOString().split("T")[0],
      document_remarks: remarks,
      tags: tags.map((tag) => ({ tag_name: tag.value })),
      user_id: "current_user_id",
    };
  }, [majorHead, minorHead, selectedDate, remarks, tags]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsLoading(true);
      setUploadStatus({ message: "Uploading file...", type: "info" });

      try {
        const formData = new FormData();
        if (selectedFile) {
          formData.append("file", selectedFile);
        }
        formData.append("data", JSON.stringify(prepareFormData()));

        await new Promise((resolve) => setTimeout(resolve, 1500));

        setUploadStatus({
          message: "File uploaded successfully!",
          type: "success",
        });
        resetForm();
      } catch (error) {
        console.error("Upload error:", error);
        setUploadStatus({
          message: "Upload failed. Please try again.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFile, prepareFormData, validateForm]
  );

  // Reset form after successful upload
  const resetForm = useCallback(() => {
    setSelectedFile(null);
    setMajorHead(null);
    setMinorHead(null);
    setTags([]);
    setRemarks("");
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  }, []);

  // Get current minor head options based on major head selection
  const getMinorHeadOptions = useCallback(() => {
    if (!majorHead) return [];
    return minorHeadOptions[majorHead.value] || [];
  }, [majorHead]);

  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className={styles.uploadContainer}>
        <h1 className={styles.title}>Upload Document</h1>

        <form onSubmit={handleSubmit} className={styles.uploadForm} aria-labelledby="form-title">
          {/* Date Picker */}
          <div className={styles.formGroup}>
            <label htmlFor="document-date" className={styles.label}>
              Document Date *
            </label>
            <DatePicker
              id="document-date"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/mm/yyyy"
              className={styles.datePicker}
              required
              aria-required="true"
              maxDate={new Date()}
            />
          </div>

          {/* Category Dropdown */}
          <div className={styles.formGroup}>
            <label htmlFor="major-head" className={styles.label}>
              Category *
            </label>
            <Select
              id="major-head"
              options={majorHeadOptions}
              value={majorHead}
              onChange={setMajorHead}
              placeholder="Select Personal or Professional"
              className={styles.dropdown}
              classNamePrefix="select"
              required
              aria-required="true"
              isClearable
            />
          </div>

          {/* Sub-category Dropdown (dynamic) */}
          <div className={styles.formGroup}>
            <label htmlFor="minor-head" className={styles.label}>
              {majorHead?.value === "Personal" ? "Name" : "Department"} *
            </label>
            <Select
              id="minor-head"
              options={getMinorHeadOptions()}
              value={minorHead}
              onChange={setMinorHead}
              placeholder={`Select ${
                majorHead?.value === "Personal" ? "name" : "department"
              }`}
              className={styles.dropdown}
              classNamePrefix="select"
              isDisabled={!majorHead}
              required
              aria-required="true"
              isClearable
            />
          </div>

          {/* Tags Input */}
          <div className={styles.formGroup}>
            <label htmlFor="document-tags" className={styles.label}>
              Tags
            </label>
            <CreatableSelect
              id="document-tags"
              isMulti
              options={availableTags}
              value={tags}
              onChange={setTags}
              placeholder="Add or select tags"
              className={styles.dropdown}
              classNamePrefix="select"
              aria-label="Document tags"
            />
          </div>

          {/* Remarks */}
          <div className={styles.formGroup}>
            <label htmlFor="document-remarks" className={styles.label}>
              Remarks
            </label>
            <textarea
              id="document-remarks"
              className={styles.textarea}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any additional remarks..."
              rows={3}
              aria-label="Document remarks"
            />
          </div>

          {/* File Upload */}
          <div className={styles.formGroup}>
            <label htmlFor="file-upload" className={styles.label}>
              Document *
            </label>
            <div className={styles.fileUploadWrapper}>
              <label htmlFor="file-upload" className={styles.fileUploadLabel}>
                {selectedFile ? (
                  <>
                    <span className={styles.fileName}>{selectedFile.name}</span>
                    <span className={styles.fileSize}>
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)
                    </span>
                  </>
                ) : (
                  "Choose file (PDF or Image)"
                )}
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  className={styles.fileInput}
                  required
                  aria-required="true"
                />
              </label>
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    const fileInput = document.getElementById("file-upload");
                    if (fileInput) fileInput.value = "";
                  }}
                  className={styles.clearFileButton}
                  aria-label="Clear selected file"
                >
                  ×
                </button>
              )}
            </div>
            <p className={styles.fileHint}>
              Allowed formats: PDF, JPG, PNG, GIF (Max 10MB)
            </p>
          </div>

          {/* Status Message */}
          {uploadStatus && (
            <div
              className={`${styles.statusMessage} ${styles[uploadStatus.type]}`}
              role="alert"
              aria-live="polite"
            >
              {uploadStatus.message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} aria-hidden="true"></span>
                <span>Uploading...</span>
              </>
            ) : (
              "Upload Document"
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default FileUpload;