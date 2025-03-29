"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import style from "../styles/login.module.css";

const Login = () => {
  const [registration, setRegistration] = useState(false);
  const [mobile, setMobile] = useState("6263986109"); // Pre-filled with your mobile number
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const sendOtp = async () => {
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/generateOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number: mobile
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setResendDisabled(true);
        setTimer(60);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/validateOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number: mobile,
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in localStorage or context for future API calls
        localStorage.setItem("token", data.token);
        // Redirect to the upload-document page
        router.push("/upload-document");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let countdown;
    if (otpSent && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  return (
    <section className={style.section}>
      <div className={style.shape1}></div>
      <div className={style.shape2}></div>

      {registration ? (
        <form className={style.loginForm}>
          <h3 className={style.formTitle}>Admin Registration</h3>

          <label htmlFor="username" className={style.formLabel}>
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            id="username"
            required
            className={style.formInput}
          />

          <label htmlFor="password" className={style.formLabel}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            id="password"
            required
            className={style.formInput}
          />

          <button type="submit" className={style.formButton} disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
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
        <form className={style.loginForm}>
          <h3 className={style.formTitle}>Login Here</h3>

          {error && <div className={style.errorMessage}>{error}</div>}

          <label htmlFor="mobile" className={style.formLabel}>
            Mobile Number
          </label>
          <input
            type="tel"
            placeholder="Enter Mobile Number"
            id="mobile"
            className={style.formInput}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
          />

          {!otpSent ? (
            <button
              type="button"
              className={style.formButton}
              onClick={sendOtp}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <label htmlFor="otp" className={style.formLabel}>
                Enter OTP
              </label>
              <input
                type="number"
                placeholder="Enter 6-digit OTP"
                id="otp"
                className={style.formInput}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />

              <button
                type="button"
                className={style.formButton}
                onClick={verifyOtp}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className={style.resend}>
                {resendDisabled ? (
                  <p>Resend OTP in {timer}s</p>
                ) : (
                  <button
                    type="button"
                    className={style.resendButton}
                    onClick={sendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}

          <div className={style.fromIndication}>
            <div>
              Admin?{" "}
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