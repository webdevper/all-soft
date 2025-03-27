'use client'
import style from './page.module.css';
import OtpAuth from "./components/login";

const Page = () => {
  return (
   <>
<section className={style.section}>
<OtpAuth/>
</section>
   </>
  )
}

export default Page
