"use client";

import { useEffect, useState } from "react";
import { getBoards } from "@/services/board.service";
import { getClasses } from "@/services/class.service";
import { sendOTP, verifyOTP } from "@/services/otp.service";
import { toast } from "sonner";
import { studentSignup } from "@/services/student-auth.service";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",

    boardId: "",
    classId: "",

    password: "",
  });

  const [step, setStep] = useState(1);

  const [boards, setBoards] = useState<any[]>([]);

  const [selectedBoard, setSelectedBoard] = useState("");

  const [classes, setClasses] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState("");

  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isPasswordValid = formData.password.length >= 8;

  const passwordsMatch = formData.password === confirmPassword;

  const isStepOneValid =
    formData.name.trim() &&
    validateEmail(formData.email) &&
    formData.phone.length === 10;

  const handleSendOTP = async () => {
    try {
      setLoading(true);

      await sendOTP(formData.email, "SIGNUP");

      setOtpSent(true);

      toast.success("OTP sent successfully 📧");

      setStep(5);
    } catch (error) {
      console.error(error);

      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);

      await verifyOTP(formData.email, otp, "SIGNUP");

      toast.success("OTP verified successfully");

      await handleCreateAccount();
    } catch (error) {
      console.error(error);

      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);

      const result = await studentSignup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        boardId: formData.boardId,
        classId: formData.classId,
        password: formData.password,
      });

      localStorage.setItem("token", result.token);

      toast.success("Welcome to NBCA");

      window.location.href = "/student";
    } catch (error) {
      console.error(error);

      toast.error("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBoards = async () => {
      try {
        const boardResult = await getBoards();

        const classResult = await getClasses();

        setBoards(boardResult.data || []);
        setClasses(classResult.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, []);

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center gap-3">
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-violet-600" />
          </div>

          <div className="rounded-[35px] bg-white p-8 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]">
            <h1 className="text-center text-3xl font-bold">Verify Email</h1>

            <p className="mt-2 text-center text-slate-500">
              Enter the OTP sent to
            </p>

            <p className="text-center font-semibold text-violet-600">
              {formData.email}
            </p>

            <div className="mt-8">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
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
              disabled={otp.length !== 6 || loading}
              onClick={handleVerifyOTP}
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
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={handleSendOTP}
              className="mt-4 w-full text-violet-600 font-medium"
            >
              Resend OTP
            </button>

            <button
              onClick={() => setStep(4)}
              className="mt-2 w-full text-slate-500"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center gap-3">
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-slate-300" />
          </div>

          <div className="rounded-[35px] bg-white p-8 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]">
            <h1 className="text-center text-3xl font-bold">Create Password</h1>

            <p className="mt-2 text-center text-slate-500">
              Secure your account
            </p>

            <div className="mt-8 space-y-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className="w-full rounded-2xl bg-slate-50 px-5 py-4 outline-none shadow-inner"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 px-5 py-4 outline-none shadow-inner"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                Show Password
              </label>

              {!isPasswordValid && (
                <p className="text-sm text-red-500">
                  Password must be at least 8 characters
                </p>
              )}

              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>

            <button
              disabled={!isPasswordValid || !passwordsMatch}
              onClick={handleSendOTP}
              className={`
              mt-8
              w-full
              rounded-2xl
              py-4
              font-semibold
              text-white

              ${
                isPasswordValid && passwordsMatch
                  ? "bg-gradient-to-r from-violet-500 to-indigo-600"
                  : "bg-slate-300"
              }
            `}
            >
              Continue →
            </button>

            <button
              onClick={() => setStep(3)}
              className="mt-4 w-full text-slate-500"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    if (loading) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-3xl bg-slate-200"
            />
          ))}
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center gap-3">
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-violet-600" />
            <div className="h-3 w-3 rounded-full bg-slate-300" />
            <div className="h-3 w-3 rounded-full bg-slate-300" />
          </div>

          <div className="rounded-[35px] bg-white p-8 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]">
            <h1 className="text-center text-3xl font-bold">Select Class</h1>

            <p className="mt-2 text-center text-slate-500">Choose your class</p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {classes.map((cls: any) => (
                <button
                  key={cls.id}
                  onClick={() => {
                    setSelectedClass(cls.id);

                    setFormData({
                      ...formData,
                      classId: cls.id,
                    });
                  }}
                  className={`h-24 rounded-3xl transition

                ${
                  selectedClass === cls.id
                    ? "border-4 border-violet-500 bg-violet-50"
                    : "bg-white"
                }

                shadow-[10px_10px_20px_#d9d9d9,-10px_-10px_20px_#ffffff]
                `}
                >
                  <div className="flex h-full items-center justify-center font-semibold">
                    {cls.name} <br /> ({cls.board?.name})
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(4)}
              disabled={!selectedClass}
              className={`
              mt-8
              w-full
              rounded-2xl
              py-4
              font-semibold
              text-white

              ${
                selectedClass
                  ? "bg-gradient-to-r from-violet-500 to-indigo-600"
                  : "bg-slate-300"
              }
            `}
            >
              Continue →
            </button>

            <button
              onClick={() => setStep(2)}
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
            <div className="h-3 w-3 rounded-full bg-slate-300" />
            <div className="h-3 w-3 rounded-full bg-slate-300" />
          </div>

          <div className="rounded-[35px] bg-white p-8 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]">
            <h1 className="text-center text-3xl font-bold">Select Board</h1>

            <p className="mt-2 text-center text-slate-500">Choose your board</p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {boards.map((board: any) => (
                <button
                  key={board.id}
                  onClick={() => {
                    setSelectedBoard(board.id);
                    setFormData({ ...formData, boardId: board.id });
                  }}
                  className={`h-28 rounded-3xl transition

                ${
                  selectedBoard === board.id
                    ? "border-4 border-violet-500 bg-violet-50"
                    : "bg-white"
                }

                shadow-[10px_10px_20px_#d9d9d9,-10px_-10px_20px_#ffffff]
                `}
                >
                  <div className="flex h-full flex-col items-center justify-center">
                    <div className="text-4xl">🎓</div>

                    <span className="mt-2 font-semibold">{board.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              disabled={!selectedBoard}
              onClick={() => setStep(3)}
              className={`
    mt-8
    w-full
    rounded-2xl
    py-4
    font-semibold
    text-white

    ${
      selectedBoard
        ? "bg-gradient-to-r from-violet-500 to-indigo-600"
        : "bg-slate-300"
    }
  `}
            >
              Continue →
            </button>
            <button
              onClick={() => setStep(1)}
              className="mt-4 w-full text-slate-500"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center gap-3">
          <div className="h-3 w-3 rounded-full bg-violet-600" />
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <div className="h-3 w-3 rounded-full bg-slate-300" />
        </div>

        <div
          className="
          rounded-[35px]
          bg-white
          p-8
          shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]
        "
        >
          <h1 className="text-3xl font-bold text-center text-slate-800">
            Create Account
          </h1>

          <p className="mt-2 text-center text-slate-500">
            Let's get started with your details 👋
          </p>

          <div className="my-8 flex justify-center">
            <img src="/signup-illustration.png" alt="signup" className="h-40" />
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
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
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
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
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}

            <input
              type="tel"
              inputMode="numeric"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");

                if (value.length <= 10) {
                  setFormData({
                    ...formData,
                    phone: value,
                  });
                }
              }}
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
            type="button"
            disabled={!isStepOneValid}
            onClick={() => setStep(2)}
            className={`
              mt-6
              w-full
              rounded-2xl
              py-4
              font-semibold
              text-white
              ${
                isStepOneValid
                  ? "bg-gradient-to-r from-violet-500 to-indigo-600"
                  : "bg-slate-300 cursor-not-allowed"
              }
            `}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
