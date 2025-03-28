"use client";
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import styles from "../styles/docSearch.module.css";
import Navbar from "../components/navbar";

// Dynamically import components that use window/document with no SSR
const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default),
  { ssr: false }
);

const Select = dynamic(
  () => import("react-select").then((mod) => mod.default),
  { ssr: false }
);

const CreatableSelect = dynamic(
  () => import("react-select/creatable").then((mod) => mod.default),
  { ssr: false }
);

const DocumentSearch = () => {
  // Search form state
  const [majorHead, setMajorHead] = useState(null);
  const [minorHead, setMinorHead] = useState(null);
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Search results state
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Set hasMounted to true after component mounts
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Major and minor head options
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

  // Fetch available tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const mockTags = [
          { value: "RMC", label: "RMC" },
          { value: "2024", label: "2024" },
          { value: "work_order", label: "Work Order" },
          { value: "invoice", label: "Invoice" },
          { value: "contract", label: "Contract" },
        ];
        setAvailableTags(mockTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      setTimeout(() => {
        const mockResults = [
          {
            id: 1,
            name: "document1.pdf",
            type: "application/pdf",
            size: "2.4 MB",
            date: "2024-03-15",
            major_head: "Professional",
            minor_head: "IT",
            tags: ["RMC", "2024"],
            remarks: "Important document",
            url: "#",
          },
          {
            id: 2,
            name: "image1.png",
            type: "image/png",
            size: "1.2 MB",
            date: "2024-03-10",
            major_head: "Personal",
            minor_head: "John",
            tags: ["family"],
            remarks: "Family photo",
            url: "#",
          },
        ];
        setSearchResults(mockResults);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error searching documents:", error);
      setIsLoading(false);
    }
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    if (file.type.includes("image/") || file.type === "application/pdf") {
      setPreviewType("supported");
    } else {
      setPreviewType("unsupported");
    }
  };

  const handleDownload = (file) => {
    console.log("Downloading:", file.name);
    // In a real app, you would implement actual download logic
    // window.open(file.url, '_blank');
  };

  // Don't render anything until component has mounted
  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {/* Search Form */}
        <div className={styles.searchPanel}>
          <h2 className={styles.panelTitle}>Document Search</h2>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <Select
                  options={majorHeadOptions}
                  value={majorHead}
                  onChange={(selected) => {
                    setMajorHead(selected);
                    setMinorHead(null);
                  }}
                  placeholder="Select category"
                  isClearable
                  classNamePrefix="select"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {majorHead?.value === "Personal" ? "Name" : "Department"}
                </label>
                <Select
                  options={majorHead ? minorHeadOptions[majorHead.value] : []}
                  value={minorHead}
                  onChange={setMinorHead}
                  placeholder={`Select ${
                    majorHead?.value === "Personal" ? "name" : "department"
                  }`}
                  isDisabled={!majorHead}
                  isClearable
                  classNamePrefix="select"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>From Date</label>
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  selectsStart
                  startDate={fromDate}
                  endDate={toDate}
                  placeholderText="Select start date"
                  className={styles.dateInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>To Date</label>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  selectsEnd
                  startDate={fromDate}
                  endDate={toDate}
                  minDate={fromDate}
                  placeholderText="Select end date"
                  className={styles.dateInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tags</label>
                <CreatableSelect
                  isMulti
                  options={availableTags}
                  value={tags}
                  onChange={setTags}
                  placeholder="Search or add tags"
                  isClearable
                  classNamePrefix="select"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Search Term</label>
                <input
                  type="text"
                  className={styles.textInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  "Search Documents"
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
                <thead className={styles.tableHeader}>
                  <tr className={styles.tableRow}>
                    <th className={styles.tableCell}>File Name</th>
                    <th className={styles.tableCell}>Type</th>
                    <th className={styles.tableCell}>Size</th>
                    <th className={styles.tableCell}>Date</th>
                    <th className={styles.tableCell}>Category</th>
                    <th className={styles.tableCell}>Tags</th>
                    <th className={styles.tableCell}>Actions</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {searchResults.map((file) => (
                    <tr key={file.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.fileName}>
                          {file.type.includes("image/") ? (
                            <svg
                              className={styles.fileIcon}
                              viewBox="0 0 24 24"
                            >
                              <path d="M8.5 13.5l2.5 3.5L15 12l4.5 6H3l5.5-7.5zM21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z" />
                            </svg>
                          ) : file.type.includes("pdf") ? (
                            <svg
                              className={styles.fileIcon}
                              viewBox="0 0 24 24"
                            >
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm4-6.91c0-.27.11-.52.29-.71l1.48-1.48c.19-.18.44-.29.71-.29.27 0 .52.11.71.29l1.48 1.48c.18.19.29.44.29.71V20H10v-6.91z" />
                            </svg>
                          ) : (
                            <svg
                              className={styles.fileIcon}
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
                            </svg>
                          )}
                          <span>{file.name}</span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.fileType}>
                          {file.type.split("/").pop().toUpperCase()}
                        </span>
                      </td>
                      <td className={styles.tableCell}>{file.size}</td>
                      <td className={styles.tableCell}>{file.date}</td>
                      <td className={styles.tableCell}>
                        <span className={styles.categoryBadge}>
                          {file.major_head} / {file.minor_head}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.tags}>
                          {file.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handlePreview(file)}
                            className={styles.iconButton}
                            title="Preview"
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
            <div
              className={styles.previewOverlay}
              onClick={() => setPreviewFile(null)}
            ></div>
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
                {previewType === "supported" ? (
                  <div className={styles.previewContainer}>
                    {previewFile.type.includes("image/") ? (
                      <div className={styles.imagePreview}>
                        <div className={styles.imagePlaceholder}>
                          <svg viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                          </svg>
                          <p>Image preview would be displayed here</p>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.pdfPreview}>
                        <div className={styles.pdfPlaceholder}>
                          <svg viewBox="0 0 24 24">
                            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
                          </svg>
                          <p>PDF preview would be displayed here</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.unsupportedPreview}>
                    <svg viewBox="0 0 24 24">
                      <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    </svg>
                    <h4>Preview not available</h4>
                    <p>This file type cannot be previewed in the browser.</p>
                  </div>
                )}
              </div>

              <div className={styles.previewFooter}>
                <div className={styles.fileMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Uploaded:</span>
                    <span>{previewFile.date}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Size:</span>
                    <span>{previewFile.size}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Category:</span>
                    <span>
                      {previewFile.major_head} / {previewFile.minor_head}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Remarks:</span>
                    <span>{previewFile.remarks}</span>
                  </div>
                </div>

                <div className={styles.previewActions}>
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className={styles.secondaryButton}
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