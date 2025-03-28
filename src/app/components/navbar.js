"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import style from "../styles/nav.module.css";

const Navbar = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");

  // Set active tab based on current path
  useEffect(() => {
    if (pathname === "/upload-document") {
      setActiveTab("upload");
    } else if (pathname === "/search-document") {
      setActiveTab("search");
    }
  }, [pathname]);

  return (
    <nav className={style.navbar}>
      <ul>
        <li>
          <Link
            className={activeTab === "upload" ? style.active : ""}
            onClick={() => setActiveTab("upload")}
            href="/upload-document"
          >
            Upload Document
          </Link>
        </li>
        <li>
          <Link
            className={activeTab === "search" ? style.active : ""}
            onClick={() => setActiveTab("search")}
            href="/search-document"
          >
            Search Document
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
