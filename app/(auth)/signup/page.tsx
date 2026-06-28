"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import { toast } from "sonner";
import { z } from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { PUser } from "@/types/UserTypes";
import { Loader2 } from "lucide-react";

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      const { fullName, username, password } = data;

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post<ApiResponse<PUser>>(
        "/api/auth/signup",
        formData,
      );

      toast.success(response.data.message);
      router.replace("/signin");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<PUser>>;
      const errorMessage =
        axiosError?.response?.data?.message ||
        "There was a problem during signup. Please try again later";
      toast.error(errorMessage);
    }
  };

  return (
    <section className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px]">
        {/* Eyebrow + heading */}
        <div className="mb-8">
          <p className="font-mono text-[11px] tracking-[0.2em] text-indigo-500 uppercase mb-3">
            New account
          </p>
          <h1 className="text-3xl font-semibold text-zinc-50 tracking-tight">
            Open your journal
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Track every trade. Review every decision.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                id="fullName"
                {...register("fullName")}
                placeholder="Jordan Belfort"
                autoComplete="name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors duration-150 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1.5">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                id="username"
                {...register("username")}
                placeholder="jbelfort"
                autoComplete="username"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors duration-150 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1.5">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register("password")}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors duration-150 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-lg py-2.5 mt-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create account
            </Button>
          </form> 
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-indigo-500 hover:text-indigo-400 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}