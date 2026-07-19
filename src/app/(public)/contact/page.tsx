"use client";

import { useForm } from "react-hook-form";
import { sendContactMessage } from "@/services/contact.service";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEnvelope, FaMapMarkerAlt, FaGlobe, FaPaperPlane } from "react-icons/fa";

export default function ContactPage() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const result = await sendContactMessage(data);
      toast.success(result.data.message || "Message sent successfully!");
      reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-slate-50 py-24">
        <div className="absolute inset-0 bg-blue-600/5 -z-0"></div>
        <div className="mx-auto max-w-5xl px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Get in Touch</h1>
          <p className="mt-4 text-slate-500 font-medium text-lg">
            Have questions about admissions, classes, or our learning programs? We're here to help.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-12 md:grid-cols-2">
            
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900">Let's connect</h2>
              <p className="text-slate-500 leading-relaxed">
                Our support team is ready to assist you with any queries regarding your learning journey at NBCA.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:border-blue-200 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-white text-blue-600 flex items-center justify-center text-xl shadow-sm border border-slate-100">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Email Us</h3>
                    <p className="text-sm text-slate-500">support@nbca.co.in</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:border-blue-200 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center text-xl shadow-sm border border-slate-100">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Our Location</h3>
                    <p className="text-sm text-slate-500">Jalpaiguri, West Bengal</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:border-blue-200 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-white text-purple-600 flex items-center justify-center text-xl shadow-sm border border-slate-100">
                    <FaGlobe />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Platform</h3>
                    <p className="text-sm text-slate-500">Online Learning Platform</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <input
                  {...register("name", { required: true })}
                  placeholder="Your Full Name"
                  className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                />
                <input
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="Your Email Address"
                  className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>

              <input
                {...register("phone")}
                placeholder="Phone Number (Optional)"
                className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />

              <textarea
                {...register("message", { required: true })}
                placeholder="How can we help you today?"
                rows={5}
                className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium resize-none"
              />

              <button
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : <>Send Message <FaPaperPlane /></>}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}