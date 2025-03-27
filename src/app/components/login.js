import React, { useState } from "react";
import style from "../styles/login.module.css"; // Import CSS Module

const Login = () => {
  const [registration, setRegistration] = useState(false); // Toggle Login/Register
  const [mobile, setMobile] = useState(""); // Mobile number state
  const [otp, setOtp] = useState(""); // OTP state
  const [otpSent, setOtpSent] = useState(false); // OTP sent state
  const [generatedOtp, setGeneratedOtp] = useState(""); // Store generated OTP (for testing)
  const [token, setToken] = useState(""); // Store authentication token

  // Function to handle OTP request (mock API for testing)
  const sendOtp = () => {
    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const fakeOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    setGeneratedOtp(fakeOtp); // Store OTP for testing
    setOtpSent(true);
    alert(`OTP sent successfully! (For testing: ${fakeOtp})`);
  };

  // Function to handle OTP verification
  const verifyOtp = () => {
    if (otp === generatedOtp) {
      const fakeToken = `token-${Math.random().toString(36).substr(2, 10)}`;
      setToken(fakeToken); // Store fake token
      alert("Login successful! (Token: " + fakeToken + ")");
    } else {
      alert("Invalid OTP. Try again.");
    }
  };

  return (
    <section className={style.section}>
      <div className={style.shape1}></div>
      <div className={style.shape2}></div>

      {registration ? (
        // Registration Form
        <form className={style.loginForm}>
          <h3 className={style.formTitle}>Register Here</h3>

          <label htmlFor="name" className={style.formLabel}>
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            id="name"
            className={style.formInput}
          />

          <label htmlFor="profession" className={style.formLabel}>
            Profession
          </label>
          <input
            type="text"
            placeholder="Enter Profession"
            id="profession"
            className={style.formInput}
          />

          <label htmlFor="email" className={style.formLabel}>
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            id="email"
            className={style.formInput}
          />

          <label htmlFor="mobile" className={style.formLabel}>
            Number
          </label>
          <input
            type="tel"
            placeholder="Enter Mobile Number"
            id="mobile"
            className={style.formInput}
          />

          <button type="submit" className={style.formButton}>
            Register
          </button>

          <div className={style.fromIndication}>
            <div>
              Already have an account?{" "}
              <span
                onClick={() => setRegistration(false)}
                className={style.toggleForm}
              >
                Login
              </span>
            </div>
          </div>
        </form>
      ) : (
        // Login Form with OTP
        <form className={style.loginForm}>
          <h3 className={style.formTitle}>Login Here</h3>

          <label htmlFor="mobile" className={style.formLabel}>
            Mobile Number
          </label>
          <input
            type="tel"
            placeholder="Enter Mobile Number"
            id="mobile"
            className={style.formInput}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          {!otpSent ? (
            <button type="button" className={style.formButton} onClick={sendOtp}>
              Send OTP
            </button>
          ) : (
            <>
              <label htmlFor="otp" className={style.formLabel}>
                Enter OTP
              </label>
              <input
                type="number"
                placeholder="Enter OTP"
                id="otp"
                className={style.formInput}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button type="button" className={style.formButton} onClick={verifyOtp}>
                Verify OTP
              </button>
              <p className={style.testOtp}>Test OTP: {generatedOtp}</p> {/* Show OTP for testing */}
            </>
          )}

          <div className={style.fromIndication}>
            <div>
              Create an account?{" "}
              <span
                onClick={() => setRegistration(true)}
                className={style.toggleForm}
              >
                Register{" "}
              </span>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

export default Login;
