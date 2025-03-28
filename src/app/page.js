"use client";
import style from "./page.module.css";
import OtpAuth from "./components/login";
// import OtpAuth from "./components/uploadDoc";
// import OtpAuth from "./components/docSearch";

const Page = () => {
  return (
    <>
      <section>
        <OtpAuth />
      </section>
    </>
  );
};

export default Page;
