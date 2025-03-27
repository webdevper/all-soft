import React, { useState, useEffect } from "react";
import style from "../styles/login.module.css"; // Import CSS Module

const Login = () => {
  const [registration, setRegistration] = useState(false); // Toggle Login/Register
  const [mobile, setMobile] = useState(""); // Mobile number state
  const [otp, setOtp] = useState(""); // OTP state
  const [otpSent, setOtpSent] = useState(false); // OTP sent state
  const [generatedOtp, setGeneratedOtp] = useState(""); // Store generated OTP (for testing)
  const [token, setToken] = useState(""); // Store authentication token
  const [timer, setTimer] = useState(60); // 1-minute timer for resend
  const [resendDisabled, setResendDisabled] = useState(true); // Resend button state

  // Function to handle OTP request (mock API for testing)
  const sendOtp = () => {
    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const fakeOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    setGeneratedOtp(fakeOtp); 
    setOtpSent(true);
    setResendDisabled(true); 
    setTimer(60); 
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

  // Timer effect for resend OTP
  useEffect(() => {
    let countdown;
    if (otpSent && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false); // Enable resend OTP
    }
    return () => clearInterval(countdown); // Cleanup
  }, [otpSent, timer]);

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
            required
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
            required
            className={style.formInput}
          />

          <label htmlFor="mobile" className={style.formLabel}>
            Number
          </label>
          <input
            type="tel"
            placeholder="Enter Mobile Number"
            id="mobile"
            required
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
            <button
              type="button"
              className={style.formButton}
              onClick={sendOtp}
            >
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

              <button
                type="button"
                className={style.formButton}
                onClick={verifyOtp}
              >
                Verify OTP
              </button>

              {/* Resend OTP Section with Timer */}
              <div className={style.resend}>
                {resendDisabled ? (
                  <p>Resend OTP in {timer}s</p>
                ) : (
                  <button
                    type="button"
                    className={style.resendButton}
                    onClick={sendOtp}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <p className={style.testOtp}>Test OTP: {generatedOtp}</p>{" "}
              {/* Show OTP for testing */}
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
