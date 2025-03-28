import Link from "next/link";
import React from "react";
import style from '../styles/nav.module.css'

const Navbar = () => {
  return (
    <nav className={style.navbar}>
      <ul>
        <li>
          <Link href="/upload-document">Upload Document</Link>
        </li>
        <li>
          <Link href="/search-document">Search Document</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
