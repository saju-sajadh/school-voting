"use client";

import { createElections } from "@/actions/server";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex flex-col justify-center items-center text-white p-4">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl">
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight animate-pulse">
            Vote for Your Future!
          </h1>
          <p className="text-lg md:text-xl max-w-md">
            Shape your school’s tomorrow. Cast your vote for student council in
            seconds!
          </p>
          <div className="flex space-x-4">
            <button
              onClick={async () => {
                const result = await createElections();
                if (result) {
                  router.push("/elections");
                }
              }}
              className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-300 transition transform hover:scale-105"
            >
              Vote Now
            </button>
          </div>
        </div>
        <div className="mt-8 md:mt-0 md:w-1/2 flex justify-center">
          <Image
            src="/hero-election.png"
            alt="Students voting"
            width={400}
            height={400}
            className="rounded-full shadow-2xl transform hover:scale-105 transition duration-300"
            priority
          />
        </div>
      </div>
    </div>
  );
}
