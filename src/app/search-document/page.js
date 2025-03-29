'use client'
import axios from 'axios';
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import "react-datepicker/dist/react-datepicker.css";
import styles from "../styles/docSearch.module.css";
import Navbar from "../components/navbar";

// Dynamically import components
const DatePicker = dynamic(() => import("react-datepicker").then((mod) => mod.default), { ssr: false });
const Select = dynamic(() => import("react-select").then((mod) => mod.default), { ssr: false });
const CreatableSelect = dynamic(() => import("react-select/creatable").then((mod) => mod.default), { ssr: false });

const DocumentSearch = () => {
  // Form state
  const [searchParams, setSearchParams] = useState({
    major_head: null,
    minor_head: null,
    tags: [],
    from_date: null,
    to_date: null,
    search_term: ""
  });
  
  // Results state
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [minorHeadOptions, setMinorHeadOptions] = useState([]);
  const [error, setError] = useState(null);

  // Mock data for fallback
  const mockTags = ["Contract", "Invoice", "Receipt", "HR", "Legal"];
  const mockPersonalNames = ["John Doe", "Jane Smith", "Robert Johnson"];
  const mockDepartments = ["Finance", "HR", "IT", "Operations"];
  const mockDocuments = [
    {
      id: 1,
      name: "document1.pdf",
      type: "application/pdf",
      size: "2.4 MB",
      date: "2024-03-15",
      major_head: "Professional",
      minor_head: "IT",
      tags: ["RMC", "2024"],
      remarks: "Important document"
    },
    {
      id: 2,
      name: "image1.png",
      type: "image/png",
      size: "1.2 MB",
      date: "2024-03-10",
      major_head: "Personal",
      minor_head: "John Doe",
      tags: ["family"],
      remarks: "Family photo"
    }
  ];

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Try real API first
        const response = await axios.get('/api/documentTags', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setAvailableTags(response.data.map(tag => ({ value: tag, label: tag })));
      } catch (err) {
        console.error("Using mock tags due to error:", err);
        setAvailableTags(mockTags.map(tag => ({ value: tag, label: tag })));
      }
    };
    
    fetchTags();
  }, []);

  // Fetch minor head options when major head changes
  useEffect(() => {
    const fetchMinorHeadOptions = async () => {
      if (!searchParams.major_head) {
        setMinorHeadOptions([]);
        return;
      }

      try {
        let options = [];
        if (searchParams.major_head.value === 'Personal') {
          // Try real API first
          const response = await axios.get('/api/personalNames', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          options = response.data;
        } else {
          // Try real API first
          const response = await axios.get('/api/professionalDepartments', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          options = response.data;
        }
        
        setMinorHeadOptions(options.map(item => ({
          value: item.id || item, // Handle both objects and strings
          label: item.name || item // Handle both objects and strings
        })));
      } catch (err) {
        console.error("Using mock data due to error:", err);
        const options = searchParams.major_head.value === 'Personal' 
          ? mockPersonalNames 
          : mockDepartments;
        
        setMinorHeadOptions(options.map(item => ({
          value: item,
          label: item
        })));
      }
    };

    fetchMinorHeadOptions();
  }, [searchParams.major_head]);


  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      const payload = {
        major_head: searchParams.major_head?.value,
        minor_head: searchParams.minor_head?.value,
        tags: searchParams.tags.map(tag => tag.value),
        from_date: searchParams.from_date?.toISOString().split('T')[0],
        to_date: searchParams.to_date?.toISOString().split('T')[0],
        search_term: searchParams.search_term
      };
  
      const response = await fetch('/api/searchDocuments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error('Search failed');
      }
  
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file preview
  const handlePreview = (file) => {
    setPreviewFile(file);
  };

  // Handle file download
  const handleDownload = async (file) => {
    try {
      const response = await axios.get(`/api/downloadDocument/${file.id}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name || 'document.pdf'); // Use file.name or a default
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Add error handling (e.g., show a notification to the user)
    }
  };

  // Handle download all as ZIP
  const handleDownloadAll = async () => {
    try {
      const payload = {
        document_ids: searchResults.map(file => file.id)
      };

      const response = await axios.post('/api/downloadDocumentsAsZip', payload, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'documents.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading ZIP:", error);
    }
  };

  // Update search parameters
  const handleParamChange = (name, value) => {
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'major_head' && { minor_head: null }) // Reset minor head when major changes
    }));
  };

  // Determine if preview is supported
  const isPreviewSupported = (file) => {
    return file.type.includes('image/') || file.type === 'application/pdf';
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {/* Search Form */}
        <div className={styles.searchPanel}>
          <h2 className={styles.panelTitle}>Document Search</h2>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.formGrid}>
              {/* Major Head (Category) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <Select
                  options={[
                    { value: 'Personal', label: 'Personal' },
                    { value: 'Professional', label: 'Professional' }
                  ]}
                  value={searchParams.major_head}
                  onChange={(option) => handleParamChange('major_head', option)}
                  placeholder="Select category"
                  isClearable
                  classNamePrefix="select"
                />
              </div>

              {/* Minor Head (Dynamic) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {searchParams.major_head?.value === 'Personal' ? 'Name' : 'Department'}
                </label>
                <Select
                  options={minorHeadOptions}
                  value={searchParams.minor_head}
                  onChange={(option) => handleParamChange('minor_head', option)}
                  isDisabled={!searchParams.major_head}
                  placeholder={
                    searchParams.major_head ? 
                      `Select ${searchParams.major_head.value === 'Personal' ? 'name' : 'department'}` : 
                      "Select category first"
                  }
                  isClearable
                  classNamePrefix="select"
                />
              </div>

              {/* Date Range */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>From Date</label>
                <DatePicker
                  selected={searchParams.from_date}
                  onChange={(date) => handleParamChange('from_date', date)}
                  selectsStart
                  startDate={searchParams.from_date}
                  endDate={searchParams.to_date}
                  placeholderText="Select start date"
                  className={styles.dateInput}
                  isClearable
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>To Date</label>
                <DatePicker
                  selected={searchParams.to_date}
                  onChange={(date) => handleParamChange('to_date', date)}
                  selectsEnd
                  startDate={searchParams.from_date}
                  endDate={searchParams.to_date}
                  minDate={searchParams.from_date}
                  placeholderText="Select end date"
                  className={styles.dateInput}
                  isClearable
                />
              </div>

              {/* Tags */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tags</label>
                <CreatableSelect
                  isMulti
                  options={availableTags}
                  value={searchParams.tags}
                  onChange={(options) => handleParamChange('tags', options)}
                  placeholder="Search or add tags"
                  isClearable
                  classNamePrefix="select"
                />
              </div>

              {/* Search Term */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Search Term</label>
                <input
                  type="text"
                  className={styles.textInput}
                  value={searchParams.search_term}
                  onChange={(e) => handleParamChange('search_term', e.target.value)}
                  placeholder="Enter search term"
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Searching...
                  </>
                ) : (
                  'Search Documents'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        <div className={styles.resultsPanel}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.panelTitle}>Search Results</h2>
            {searchResults.length > 0 && (
              <div className={styles.resultsActions}>
                <span className={styles.resultsCount}>
                  {searchResults.length} documents found
                </span>
                <button
                  onClick={handleDownloadAll}
                  className={styles.secondaryButton}
                  disabled={isLoading}
                >
                  Download All as ZIP
                </button>
              </div>
            )}
          </div>

          {isLoading && searchResults.length === 0 ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading documents...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
              </svg>
              <h3>No documents found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className={styles.resultsContainer}>
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <div className={styles.fileName}>
                          {file.type.includes('image/') ? (
                            <svg className={styles.fileIcon} viewBox="0 0 24 24">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                          ) : file.type.includes('pdf') ? (
                            <svg className={styles.fileIcon} viewBox="0 0 24 24">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm5-6.91c0-.27.11-.52.29-.71l1.48-1.48c.19-.18.44-.29.71-.29.27 0 .52.11.71.29l1.48 1.48c.18.19.29.44.29.71V20H11v-6.91z" />
                            </svg>
                          ) : (
                            <svg className={styles.fileIcon} viewBox="0 0 24 24">
                              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
                            </svg>
                          )}
                          <span>{file.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.fileType}>
                          {file.type.split('/').pop().toUpperCase()}
                        </span>
                      </td>
                      <td>{file.size}</td>
                      <td>{new Date(file.date).toLocaleDateString()}</td>
                      <td>
                        <span className={styles.categoryBadge}>
                          {file.major_head} / {file.minor_head}
                        </span>
                      </td>
                      <td>
                        <div className={styles.tags}>
                          {file.tags.map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handlePreview(file)}
                            className={styles.iconButton}
                            title="Preview"
                            disabled={!isPreviewSupported(file)}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownload(file)}
                            className={styles.iconButton}
                            title="Download"
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* File Preview Modal */}
        {previewFile && (
          <div className={styles.previewModal}>
            <div className={styles.previewOverlay} onClick={() => setPreviewFile(null)}></div>
            <div className={styles.previewContent}>
              <div className={styles.previewHeader}>
                <h3>{previewFile.name}</h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className={styles.closeButton}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              <div className={styles.previewBody}>
                {isPreviewSupported(previewFile) ? (
                  <div className={styles.previewContainer}>
                    {previewFile.type.includes('image/') ? (
                      <div className={styles.imagePreview}>
                        <img 
                          src={`/api/previewDocument/${previewFile.id}`} 
                          alt={previewFile.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = `
                              <div class="${styles.previewPlaceholder}">
                                <svg viewBox="0 0 24 24">
                                  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                                </svg>
                                <p>Image preview not available</p>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    ) : (
                      <div className={styles.pdfPreview}>
                        <iframe 
                          src={`/api/previewDocument/${previewFile.id}`}
                          title={previewFile.name}
                          className={styles.pdfViewer}
                        ></iframe>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.unsupportedPreview}>
                    <svg viewBox="0 0 24 24">
                      <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    </svg>
                    <h4>Preview not supported</h4>
                    <p>This file type cannot be previewed in the browser.</p>
                  </div>
                )}
              </div>

              <div className={styles.previewFooter}>
                <div className={styles.fileMeta}>
                  <div className={styles.metaItem}>
                    <span>Uploaded:</span>
                    <span>{new Date(previewFile.date).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Size:</span>
                    <span>{previewFile.size}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Category:</span>
                    <span>{previewFile.major_head} / {previewFile.minor_head}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Remarks:</span>
                    <span>{previewFile.remarks || 'None'}</span>
                  </div>
                </div>

                <div className={styles.previewActions}>
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className={styles.downloadButton}
                  >
                    Download File
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentSearch;