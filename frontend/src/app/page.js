"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <button
        onClick={() => router.push("/login")}
        className="px-8 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Login
      </button>
    </div>
  );
}