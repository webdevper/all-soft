'use client'
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import styles from "../styles/uploadDoc.module.css";
import Navbar from "../components/navbar";

// Dynamic imports for browser-only components
const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <input type="text" className={styles.input} disabled />
  }
);

const Select = dynamic(() => import("react-select").then((mod) => mod.default), { ssr: false });
const CreatableSelect = dynamic(() => import("react-select/creatable").then((mod) => mod.default), { ssr: false });

const FileUpload = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apis.allsoft.co/api/documentManagement';
  
  const [uploadStatus, setUploadStatus] = useState(null);
  // Form state
  const [formData, setFormData] = useState({
    document_date: new Date(),
    major_head: null,
    minor_head: null,
    tags: [],
    document_remarks: "",
    file: null
  });
  const [minorHeadOptions, setMinorHeadOptions] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch initial data (tags)
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/documentTags`, 
          { term: "" },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data && Array.isArray(response.data)) {
          setAvailableTags(response.data.map(tag => ({ 
            value: tag.tag_name, 
            label: tag.tag_name 
          })));
        }
      } catch (error) {
        toast.error("Failed to load tags");
        console.error("Tags error:", error);
      }
    };

    fetchTags();
  }, []);

  // Fetch minor head options when major head changes
  useEffect(() => {
    const fetchMinorHeadOptions = async () => {
      if (!formData.major_head) {
        setMinorHeadOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        // In a real implementation, you would fetch these from your API
        // For now using mock data as the API endpoint isn't specified
        let options = [];
        if (formData.major_head.value === 'Personal') {
          options = ["John Doe", "Jane Smith", "Robert Johnson"];
        } else {
          options = ["Finance", "HR", "IT", "Operations"];
        }

        setMinorHeadOptions(options.map(option => ({
          value: option,
          label: option
        })));
      } catch (error) {
        toast.error("Failed to load options");
        console.error("Options error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinorHeadOptions();
  }, [formData.major_head]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'major_head' && { minor_head: null }) // Reset minor head when major changes
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, and PDF files are allowed");
      e.target.value = "";
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      e.target.value = "";
      return;
    }

    handleInputChange('file', file);
    toast.success(`${file.name} selected`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.file) {
      toast.error("Please select a file");
      setIsSubmitting(false);
      return;
    }

    if (!formData.major_head || !formData.minor_head) {
      toast.error("Please select both category and sub-category");
      setIsSubmitting(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication required");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare FormData for API
      const payload = new FormData();
      payload.append('file', formData.file);
      
      // Prepare the data object as per API requirements
      const data = {
        major_head: formData.major_head.value,
        minor_head: formData.minor_head.value,
        document_date: formData.document_date.toLocaleDateString('en-GB'), // DD/MM/YYYY format
        document_remarks: formData.document_remarks,
        tags: formData.tags.map(tag => ({ tag_name: tag.value })),
        user_id: "current_user" // This should be replaced with actual user ID from auth
      };
      
      payload.append('data', JSON.stringify(data));

      const response = await axios.post(`${API_BASE_URL}/saveDocumentEntry`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        toast.success("Document uploaded successfully!");
        
        // Reset form
        setFormData({
          document_date: new Date(),
          major_head: null,
          minor_head: null,
          tags: [],
          document_remarks: "",
          file: null
        });
        document.getElementById("file-upload").value = "";
        
        setUploadStatus({
          type: 'success',
          message: 'Document uploaded successfully!'
        });
      } else {
        throw new Error(response.data?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.message || "Upload failed. Please try again.";
      toast.error(errorMessage);
      setUploadStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar/>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Document Upload</h1>
          <p className={styles.subtitle}>Upload and categorize your documents</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Date Picker */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Document Date <span className={styles.required}>*</span>
            </label>
            <DatePicker
              selected={formData.document_date}
              onChange={(date) => handleInputChange('document_date', date)}
              dateFormat="dd/MM/yyyy"
              className={styles.input}
              maxDate={new Date()}
              required
            />
          </div>

          {/* Major Head (Category) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Category <span className={styles.required}>*</span>
            </label>
            <Select
              options={[
                { value: 'Company', label: 'Company' },
                { value: 'Personal', label: 'Personal' },
                { value: 'Professional', label: 'Professional' }
              ]}
              value={formData.major_head}
              onChange={(option) => handleInputChange('major_head', option)}
              placeholder="Select category..."
              className={styles.select}
              classNamePrefix="select"
              required
            />
          </div>

          {/* Minor Head (Dynamic) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {formData.major_head?.value === 'Personal' ? 'Name' : 'Department'} <span className={styles.required}>*</span>
            </label>
            <Select
              options={minorHeadOptions}
              value={formData.minor_head}
              onChange={(option) => handleInputChange('minor_head', option)}
              isDisabled={!formData.major_head || isLoading}
              isLoading={isLoading}
              placeholder={
                isLoading ? "Loading..." : 
                formData.major_head ? 
                  `Select ${formData.major_head.value === 'Personal' ? 'name' : 'department'}` : 
                  "Select category first"
              }
              className={styles.select}
              classNamePrefix="select"
              required
            />
          </div>

          {/* Tags */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tags</label>
            <CreatableSelect
              isMulti
              options={availableTags}
              value={formData.tags}
              onChange={(options) => handleInputChange('tags', options)}
              placeholder="Add or select tags..."
              className={styles.select}
              classNamePrefix="select"
            />
          </div>

          {/* Remarks */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Remarks</label>
            <textarea
              value={formData.document_remarks}
              onChange={(e) => handleInputChange('document_remarks', e.target.value)}
              className={styles.textarea}
              placeholder="Enter any additional remarks..."
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Document <span className={styles.required}>*</span>
            </label>
            <div className={styles.fileUploadWrapper}>
              <label htmlFor="file-upload" className={styles.fileUploadLabel}>
                {formData.file ? (
                  <span className={styles.fileName}>{formData.file.name}</span>
                ) : (
                  <>
                    <svg className={styles.uploadIcon} viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    <span>Choose file</span>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  className={styles.fileInput}
                  required
                />
              </label>
              {formData.file && (
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange('file', null);
                    document.getElementById("file-upload").value = "";
                  }}
                  className={styles.clearFileButton}
                  aria-label="Clear file selection"
                >
                  &times;
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner} aria-hidden="true"></span>
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default FileUpload;