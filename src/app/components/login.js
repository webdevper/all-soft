"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import style from "../styles/login.module.css";

const Login = () => {
  const [registration, setRegistration] = useState(false);
  const [mobile, setMobile] = useState("6263986109");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const validateMobile = () => {
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  };

  const validateOtp = () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    if (!validateMobile()) return;

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
        toast.success("OTP sent successfully");
        setOtpSent(true);
        setResendDisabled(true);
        setTimer(60);
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!validateOtp()) return;

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
        // Store token securely
        localStorage.setItem("token", data.token);
        localStorage.setItem("mobile", mobile);
        
        toast.success("Login successful");
        router.push("/upload-document");
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit OTP when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && otpSent) {
      verifyOtp();
    }
  }, [otp]);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  return (
    <section className={style.section}>
      <div className={style.shape1}></div>
      <div className={style.shape2}></div>

      {registration ? (
        <div className={style.loginForm}>
          <h3 className={style.formTitle}>Admin Registration</h3>
          <p className={style.infoText}>
            Please contact system administrator for registration
          </p>
          <button
            type="button"
            className={style.formButton}
            onClick={() => setRegistration(false)}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className={style.loginForm}>
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
            onChange={(e) => {
              setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
              setError("");
            }}
            maxLength={10}
            disabled={otpSent}
          />

          {!otpSent ? (
            <button
              type="button"
              className={style.formButton}
              onClick={sendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={style.spinner}></span>
                  Sending...
                </>
              ) : (
                "Send OTP"
              )}
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
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError("");
                }}
                maxLength={6}
                autoFocus
              />

              <button
                type="button"
                className={style.formButton}
                onClick={verifyOtp}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <span className={style.spinner}></span>
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className={style.resend}>
                {resendDisabled ? (
                  <p>Resend OTP in {timer}s</p>
                ) : (
                  <button
                    type="button"
                    className={style.resendButton}
                    onClick={() => {
                      sendOtp();
                      setOtp("");
                    }}
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
              <button
                type="button"
                onClick={() => setRegistration(true)}
                className={style.toggleForm}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Login;