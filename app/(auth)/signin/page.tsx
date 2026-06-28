"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/schemas/signInSchema";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      username: data.username,
      password: data.password,
    });

    if (result?.error) {
      toast.error("Invalid username or password");
    } else {
      router.push("/");
    }
  };

  return (
    <section className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px]">
        {/* Eyebrow + heading */}
        <div className="mb-8">
          <p className="font-mono text-[11px] tracking-[0.2em] text-indigo-500 uppercase mb-3">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold text-zinc-50 tracking-tight">
            Sign in to your journal
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Pick up where your last trade left off.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-zinc-400 mb-1.5"
              >
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
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-400 mb-1.5"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register("password")}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors duration-150 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-lg py-2.5 mt-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}