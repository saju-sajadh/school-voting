"use client";

import { useState, useEffect } from "react";
import {
  submitVotes,
  getVoterCount,
  getElectionWinners,
} from "../../actions/server";
import toast, { Toaster } from "react-hot-toast";
import { FaTrophy } from "react-icons/fa";

const elections = [
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
 
];

export default function ElectionScreen() {
  const [selectedNominees, setSelectedNominees] = useState({});
  const [voterCount, setVoterCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [voteSubmitted, setVoteSubmitted] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Hardcoded password for local verification (in a real app, this should be more secure)
  const ADMIN_PASSWORD = "election2025";

  useEffect(() => {
    async function fetchVoterCount() {
      const result = await getVoterCount();
      if (result.count !== undefined) {
        console.log('Client received voter count:', result.count);
        setVoterCount(result.count);
      } else {
        console.error('Client voter count error:', result.error);
        toast.error(result.error);
      }
    }
    fetchVoterCount();
  }, [voteSubmitted]);

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

    if (votes.length !== 5) {
      toast.error("Please choose 5 nominees");
      return;
    }

    formData.set("votes", JSON.stringify(votes));

    const result = await submitVotes(formData);

    if (result.error) {
      console.error('Vote submission error:', result.error);
      toast.error("Something went wrong! " + result.error);
    } else {
      toast.success("Voted successfully");
      setSelectedNominees({});
      setVoteSubmitted((prev) => prev + 1);
    }
  };

  const handleShowResults = () => {
    setShowPasswordModal(true);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      const result = await getElectionWinners();
      if (result.results) {
        const sortedResults = result.results.map((election) => ({
          ...election,
          nominees: [...election.nominees].sort((a, b) =>
            a.name === election.winner ? -1 : b.name === election.winner ? 1 : 0
          ),
        }));
        setResults(sortedResults);
        setShowResults(true);
        setShowPasswordModal(false);
      } else {
        console.error('Election results error:', result.error);
        toast.error(result.error);
      }
    } else {
      setPasswordError("Incorrect password");
      toast.error("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col items-center p-4 text-white overflow-x-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={handleShowResults}
          className="p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
          aria-label="Show election results"
        >
          <FaTrophy size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 text-center animate-fade-in">
        Mar Baselios Maruthamonpally Election
      </h1>
      <form action={handleSubmit} className="w-full max-w-3xl">
        <div className="grid grid-cols-1 gap-4">
          {elections.map((election, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-20 backdrop-blur-lg p-4 sm:p-5 rounded-2xl shadow-xl border border-purple-300 border-opacity-30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-center mb-3 sm:mb-4 text-yellow-600">
                {election.title}
              </h2>
              <div className="flex flex-col space-y-2">
                {election.nominees.map((nominee, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      handleSelectNominee(election.title, nominee.name)
                    }
                    className={`w-full flex items-center justify-between space-x-2 sm:space-x-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-2 px-3 sm:px-4 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 transform hover:scale-105 ${
                      selectedNominees[election.title] === nominee.name
                        ? "ring-2 ring-green-400"
                        : ""
                    }`}
                    aria-label={`Select ${nominee.name} for ${election.title}`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                        {getInitials(nominee.name)}
                      </div>
                      <span className="text-sm sm:text-base">
                        {nominee.name}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-2 sm:w-6 sm:h-3 rounded-full transition-all duration-300 ${
                        selectedNominees[election.title] === nominee.name
                          ? "bg-green-400 shadow-[0_0_8px_#34d399] sm:shadow-[0_0_10px_#34d399]"
                          : "bg-white"
                      }`}
                    ></div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 sm:mt-6">
          <div></div>
          <button
            type="submit"
            className="bg-gradient-to-r from-green-400 to-teal-400 text-gray-900 px-6 py-2 sm:px-8 sm:py-3 rounded-full font-semibold hover:from-green-300 hover:to-teal-300 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            aria-label="Submit all votes"
          >
            Submit Votes
          </button>
          <div className="text-center text-base sm:text-lg font-bold bg-transparent bg-opacity-20 backdrop-blur-lg p-2 sm:p-3 rounded-lg">
            Voters: {voterCount}
          </div>
        </div>
      </form>
      {showPasswordModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-30 backdrop-blur-xl p-6 rounded-3xl w-full max-w-md mx-4 shadow-2xl border border-yellow-300 border-opacity-50">
            <h2 className="text-xl font-bold text-center mb-4 text-yellow-500">
              Enter Admin Password
            </h2>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-lg border text-gray-900 mb-4"
                placeholder="Password"
                aria-label="Admin password"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mb-4">{passwordError}</p>
              )}
              <div className="flex justify-center space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-400 to-teal-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-green-300 hover:to-teal-300 transition-all duration-300"
                  aria-label="Submit password"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-gradient-to-r from-red-400 to-pink-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-red-300 hover:to-pink-300 transition-all duration-300"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showResults && (
        <div className="fixed inset-0  flex items-start sm:items-center justify-center z-50 animate-fade-in overflow-y-auto py-4 sm:py-0">
          <div className="bg-white bg-opacity-30 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-3xl w-full max-w-lg sm:max-w-2xl md:max-w-3xl mx-4 shadow-2xl border border-yellow-300 border-opacity-50 transform animate-slide-up">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-4 sm:mb-6 text-yellow-500 animate-pulse">
              Election Results
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {results.map((election, index) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-20 p-4 sm:p-5 rounded-xl shadow-lg border border-purple-300 border-opacity-30"
                >
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-center mb-2 sm:mb-3 text-purple-600">
                    {election.title}
                  </h3>
                  <div className="space-y-2">
                    {election.nominees.map((nominee, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                          nominee.name === election.winner
                            ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 scale-105"
                            : "bg-white bg-opacity-10 text-black"
                        }`}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {nominee.name === election.winner && (
                            <FaTrophy className="text-yellow-300" size={16} />
                          )}
                          <span className="font-medium text-sm sm:text-base">
                            {nominee.name}
                          </span>
                        </div>
                        <span className="font-bold text-sm sm:text-base">
                          {nominee.votes} votes
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 sm:mt-8">
              <button
                onClick={() => setShowResults(false)}
                className="bg-gradient-to-r from-red-400 to-pink-400 text-gray-900 px-6 py-2 sm:px-8 sm:py-3 rounded-full font-semibold hover:from-red-300 hover:to-pink-300 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                aria-label="Close results"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}