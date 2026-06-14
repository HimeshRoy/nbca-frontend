"use client";

import { useForm } from "react-hook-form";
import { sendContactMessage } from "@/services/contact.service";
import { useState } from "react";

export default function ContactPage() {
  const { register, handleSubmit, reset } = useForm();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const result = await sendContactMessage(data);

      alert(result.data.message);

      reset();
    } catch (error) {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="bg-blue-50 py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-5xl font-bold">Contact Us</h1>

          <p className="mt-4 text-gray-600">
            Have questions about admissions, classes or learning programs?
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">Get In Touch</h2>

              <div className="mt-8 space-y-6">
                <div className="rounded-xl border p-5">
                  <h3 className="font-semibold">Email</h3>

                  <p>support@nbca.co.in</p>
                </div>

                <div className="rounded-xl border p-5">
                  <h3 className="font-semibold">Location</h3>

                  <p>Jalpaiguri, West Bengal</p>
                </div>

                <div className="rounded-xl border p-5">
                  <h3 className="font-semibold">Platform</h3>

                  <p>Online Learning Platform</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <input
                {...register("name")}
                placeholder="Your Name"
                className="w-full rounded-xl border p-4"
              />

              <input
                {...register("email")}
                placeholder="Your Email"
                className="w-full rounded-xl border p-4"
              />

              <input
                {...register("phone")}
                placeholder="Phone Number"
                className="w-full rounded-xl border p-4"
              />

              <textarea
                {...register("message")}
                placeholder="Message"
                rows={6}
                className="w-full rounded-xl border p-4"
              />

              <button
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 py-4 font-semibold text-white"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
