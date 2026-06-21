"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  sendOTP,
  verifyOTP,
} from "@/services/otp.service";

import {
  resetPassword,
} from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
  try {
    setLoading(true);

    await sendOTP(
      email,
      "FORGOT_PASSWORD"
    );

    toast.success(
      "OTP sent successfully 📧"
    );

    setStep(2);
  } catch (error) {
    toast.error(
      "Failed to send OTP"
    );
  } finally {
    setLoading(false);
  }
};

const handleVerifyOTP = async () => {
  try {
    setLoading(true);

    await verifyOTP(
      email,
      otp,
      "FORGOT_PASSWORD"
    );

    toast.success(
      "OTP verified successfully"
    );

    setStep(3);
  } catch (error) {
    toast.error(
      "Invalid OTP"
    );
  } finally {
    setLoading(false);
  }
};

const handleResetPassword =
  async () => {
    try {
      setLoading(true);

      await resetPassword(
        email,
        password
      );

      toast.success(
        "Password updated successfully 🎉"
      );

      router.push("/login");
    } catch (error) {
      toast.error(
        "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
  const isPasswordValid =
    password.length >= 8;

  const passwordsMatch =
    password === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">

      <div className="w-full max-w-sm">

        <div className="mb-6 flex justify-center gap-3">
          <div className="h-3 w-3 rounded-full bg-violet-600" />
          <div className="h-3 w-3 rounded-full bg-violet-600" />
          <div className="h-3 w-3 rounded-full bg-violet-600" />
        </div>

        <div className="rounded-[35px] bg-white p-8 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]">

          <h1 className="text-center text-3xl font-bold">
            New Password
          </h1>

          <p className="mt-2 text-center text-slate-500">
            Create a new secure password
          </p>

          <div className="mt-8 space-y-4">

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="New Password"
              className="
                w-full
                rounded-2xl
                bg-slate-50
                px-5
                py-4
                outline-none
                shadow-inner
              "
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm Password"
              className="
                w-full
                rounded-2xl
                bg-slate-50
                px-5
                py-4
                outline-none
                shadow-inner
              "
            />

          </div>

          {!isPasswordValid && password && (
            <p className="mt-3 text-sm text-red-500">
              Password must be at least 8 characters
            </p>
          )}

          {confirmPassword &&
            !passwordsMatch && (
              <p className="mt-3 text-sm text-red-500">
                Passwords do not match
              </p>
          )}

          <button
            disabled={
              !isPasswordValid ||
              !passwordsMatch
            }
            onClick={
              handleResetPassword
            }
            className={`
              mt-8
              w-full
              rounded-2xl
              py-4
              font-semibold
              text-white

              ${
                isPasswordValid &&
                passwordsMatch
                  ? "bg-gradient-to-r from-violet-500 to-indigo-600"
                  : "bg-slate-300"
              }
            `}
          >
            {loading
              ? "Updating..."
              : "Reset Password"}
          </button>

          <button
            onClick={() =>
              setStep(2)
            }
            className="mt-4 w-full text-slate-500"
          >
            Back
          </button>

        </div>

      </div>

    </div>
  );
}

  if (step === 2) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">

      <div className="w-full max-w-sm">

        <div className="mb-6 flex justify-center gap-3">
          <div className="h-3 w-3 rounded-full bg-violet-600" />
          <div className="h-3 w-3 rounded-full bg-violet-600" />
          <div className="h-3 w-3 rounded-full bg-slate-300" />
        </div>

        <div className="rounded-[35px] bg-white p-8 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]">

          <h1 className="text-center text-3xl font-bold">
            Verify OTP
          </h1>

          <p className="mt-2 text-center text-slate-500">
            Enter OTP sent to
          </p>

          <p className="text-center font-semibold text-violet-600">
            {email}
          </p>

          <div className="mt-8">

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="000000"
              className="
                w-full
                rounded-2xl
                bg-slate-50
                px-5
                py-4
                text-center
                text-2xl
                tracking-[10px]
                outline-none
                shadow-inner
              "
            />

          </div>

          <button
            disabled={
              otp.length !== 6
            }
            onClick={
              handleVerifyOTP
            }
            className={`
              mt-8
              w-full
              rounded-2xl
              py-4
              font-semibold
              text-white

              ${
                otp.length === 6
                  ? "bg-gradient-to-r from-violet-500 to-indigo-600"
                  : "bg-slate-300"
              }
            `}
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>

          <button
            onClick={
              handleSendOTP
            }
            className="mt-4 w-full text-violet-600 font-medium"
          >
            Resend OTP
          </button>

          <button
            onClick={() =>
              setStep(1)
            }
            className="mt-2 w-full text-slate-500"
          >
            Back
          </button>

        </div>

      </div>

    </div>
  );
}

  if (step === 1) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">

      <div className="w-full max-w-sm">

        <div className="mb-6 flex justify-center gap-3">
          <div className="h-3 w-3 rounded-full bg-violet-600" />
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <div className="h-3 w-3 rounded-full bg-slate-300" />
        </div>

        <div className="rounded-[35px] bg-white p-8 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]">

          <h1 className="text-center text-3xl font-bold">
            Forgot Password
          </h1>

          <p className="mt-2 text-center text-slate-500">
            Enter your registered email
          </p>

          <div className="mt-8">

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter Email"
              className="
                w-full
                rounded-2xl
                bg-slate-50
                px-5
                py-4
                outline-none
                shadow-inner
              "
            />

          </div>

          <button
            disabled={
              !email.includes("@")
            }
            onClick={
              handleSendOTP
            }
            className={`
              mt-8
              w-full
              rounded-2xl
              py-4
              font-semibold
              text-white

              ${
                email.includes("@")
                  ? "bg-gradient-to-r from-violet-500 to-indigo-600"
                  : "bg-slate-300"
              }
            `}
          >
            {loading
              ? "Sending..."
              : "Send OTP"}
          </button>

        </div>

      </div>

    </div>
  );
}
}