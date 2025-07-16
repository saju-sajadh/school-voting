"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createElection, verifyElectionPassword, getElectionTitles } from "@/actions/server";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [newElectionTitle, setNewElectionTitle] = useState("");
  const [selectedElection, setSelectedElection] = useState("");
  const [electionTitles, setElectionTitles] = useState([]);

  useEffect(() => {
    async function fetchElections() {
      try {
        const result = await getElectionTitles();
        if (result.error) {
          toast.error("Failed to load elections: " + result.error);
        } else {
          setElectionTitles(result.titles || []);
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
        toast.error("Failed to load elections: " + error.message);
      }
    }
    fetchElections();
  }, []);

  const handleAction = (action) => {
    setModalAction(action);
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (modalAction === "create") {
      if (!newElectionTitle || !password) {
        toast.error("Please enter both election title and password");
        return;
      }
      const result = await createElection(newElectionTitle, password);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Election created successfully");
        setTimeout(() => {
          router.push(`/elections?title=${encodeURIComponent(newElectionTitle)}`);
        }, 100);
      }
    } else if (modalAction === "select") {
      if (!selectedElection || !password) {
        toast.error("Please select an election and enter its password");
        return;
      }
      const result = await verifyElectionPassword(selectedElection, password);
      if (!result.valid) {
        setPasswordError("Incorrect password");
        toast.error("Incorrect password");
        return;
      }
      toast.success("Election selected successfully");
      setTimeout(() => {
        router.push(`/elections?title=${encodeURIComponent(selectedElection)}`);
      }, 100);
    }
    setShowModal(false);
    setPassword("");
    setPasswordError("");
    setNewElectionTitle("");
    setSelectedElection("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex flex-col justify-center items-center text-white p-4">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
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
              onClick={() => handleAction("create")}
              className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-300 transition transform hover:scale-105"
            >
              Create New Election
            </button>
            <button
              onClick={() => handleAction("select")}
              className="bg-green-400 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-green-300 transition transform hover:scale-105"
            >
              Select Existing Election
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
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-30 backdrop-blur-xl p-6 rounded-3xl w-full max-w-md mx-4 shadow-2xl border border-yellow-300 border-opacity-50">
            <h2 className="text-xl font-bold text-center mb-4 text-yellow-500">
              {modalAction === "create" ? "Create New Election" : "Select Election"}
            </h2>
            <form onSubmit={handleModalSubmit}>
              {modalAction === "create" && (
                <input
                  type="text"
                  value={newElectionTitle}
                  onChange={(e) => setNewElectionTitle(e.target.value)}
                  placeholder="Election Title"
                  className="w-full p-2 rounded-lg border text-gray-900 mb-4"
                />
              )}
              {modalAction === "select" && (
                <select
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                  className="w-full p-2 rounded-lg border text-gray-900 mb-4"
                >
                  <option value="">Select an Election</option>
                  {electionTitles.map((title, index) => (
                    <option key={index} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-lg border text-gray-900 mb-4"
                placeholder="Password"
                aria-label="Election password"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mb-4">{passwordError}</p>
              )}
              <div className="flex justify-center space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-400 to-teal-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-green-300 hover:to-teal-300 transition-all duration-300"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPassword("");
                    setPasswordError("");
                    setNewElectionTitle("");
                    setSelectedElection("");
                  }}
                  className="bg-gradient-to-r from-red-400 to-pink-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-red-300 hover:to-pink-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}