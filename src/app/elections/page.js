"use client";

import { useState } from "react";
import { submitVotes } from "../../actions/server";
import toast from "react-hot-toast";

const elections = [
  {
    title: "Sports Club Secretary",
    nominees: [{ name: "Aaron Shibu Mathew" }, { name: "Alwin Raghu Chandra" }],
  },
  {
    title: "Arts Club Secretary",
    nominees: [{ name: "Shalna A S" }, { name: "Fathima J S" }],
  },
  {
    title: "Sports Captain",
    nominees: [{ name: "Fahad" }, { name: "Nasmal" }],
  },
  {
    title: "Head Boy",
    nominees: [
      { name: "Liya Prashand" },
      { name: "Devipriya B R" },
      { name: "Serina Jojee" },
    ],
  },
  {
    title: "Head Girl",
    nominees: [{ name: "Sidharth R S" }, { name: "Vinayak Suresh" }],
  },
];

export default function ElectionScreen() {
  const [selectedNominees, setSelectedNominees] = useState({});
  const [message, setMessage] = useState("");

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSelectNominee = (electionTitle, nomineeName) => {
    setSelectedNominees((prev) => ({
      ...prev,
      [electionTitle]: prev[electionTitle] === nomineeName ? "" : nomineeName,
    }));
  };

  const handleSubmit = async (formData) => {
    const votes = Object.entries(selectedNominees)
      .filter(([_, nomineeName]) => nomineeName)
      .map(([electionTitle, nomineeName]) => ({
        electionTitle,
        nomineeName,
      }));

    if (votes.length != 5) {
      toast.error("Please choose 5 nominies");
      return;
    }

    formData.set("votes", JSON.stringify(votes));

    const result = await submitVotes(formData);

    if (result.error) {
      toast.error("something went wrong!");
    } else {
      toast.success("voted successfully");
      setSelectedNominees({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col justify-center items-center p-4 text-white overflow-hidden">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-center animate-fade-in">
        Mar Baselios Maruthamonpaly Election 2025
      </h1>

      <form action={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl w-full">
          {elections.map((election, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-20 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-purple-300 border-opacity-30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <h2 className="text-lg sm:text-xl font-bold text-center mb-4 text-yellow-300">
                {election.title}
              </h2>
              <div className="flex flex-col space-y-2 gap-1">
                {election.nominees.map((nominee, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      handleSelectNominee(election.title, nominee.name)
                    }
                    className={`w-full flex items-center justify-between space-x-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-2 px-4 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 transform hover:scale-105 ${
                      selectedNominees[election.title] === nominee.name
                        ? " ring-green-400"
                        : ""
                    }`}
                    aria-label={`Select ${nominee.name} for ${election.title}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {getInitials(nominee.name)}
                      </div>
                      <span>{nominee.name}</span>
                    </div>
                    <div
                      className={`w-6 h-3 rounded-full transition-all duration-300 ${
                        selectedNominees[election.title] === nominee.name
                          ? "bg-green-400 shadow-[0_0_10px_#34d399]"
                          : "bg-white"
                      }`}
                    ></div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-gradient-to-r from-green-400 to-teal-400 text-gray-900 px-8 py-3 rounded-full font-semibold hover:from-green-300 hover:to-teal-300 transition-all duration-300 transform hover:scale-105"
            aria-label="Submit all votes"
          >
            Submit Votes
          </button>
        </div>
      </form>
    </div>
  );
}
