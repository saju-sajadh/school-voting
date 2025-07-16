"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";
import ElectionHeader from "@/components/electionHeader";
import VotingForm from "@/components/votingForm";
import PasswordModal from "@/components/passwordModel";
import AdminPanel from "@/components/adminPanel";
import ResultsPanel from "@/components/resultPanel";
import {
  getElection,
  getVoterCount,
  submitVotes,
  verifyElectionPassword,
  getElectionWinners,
  deleteElection,
} from "@/actions/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase;
try {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is missing");
  }
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error("Error initializing Supabase client:", error);
  toast.error("Failed to initialize storage client");
}

export default function ElectionScreen() {
  const searchParams = useSearchParams();
  const electionTitle = searchParams.get("title");
  const [selectedNominees, setSelectedNominees] = useState({});
  const [voterCount, setVoterCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [voteSubmitted, setVoteSubmitted] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordAction, setPasswordAction] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!electionTitle) {
      toast.error("No election title provided");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return;
    }

    let isMounted = true;

    async function fetchElection() {
      try {
        const result = await getElection(electionTitle);
        if (isMounted) {
          if (result.error) {
            toast.error("Failed to load election: " + result.error);
          } else {
            setCategories(result.categories || []);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching election:", error);
          toast.error("Failed to load election: " + error.message);
        }
      }
    }

    async function fetchVoterCount() {
      try {
        const result = await getVoterCount(electionTitle);
        if (isMounted) {
          if (result.count !== undefined) {
            setVoterCount(result.count);
          } else {
            toast.error(result.error);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching voter count:", error);
          toast.error("Failed to fetch voter count: " + error.message);
        }
      }
    }

    fetchElection();
    fetchVoterCount();

    return () => {
      isMounted = false;
    };
  }, [electionTitle, voteSubmitted]);

  const handleSelectNominee = (categoryTitle, nomineeName) => {
    setSelectedNominees((prev) => ({
      ...prev,
      [categoryTitle]: prev[categoryTitle] === nomineeName ? "" : nomineeName,
    }));
  };

  

  const handleSubmit = async (formData) => {
    const votes = Object.entries(selectedNominees)
      .filter(([_, nomineeName]) => nomineeName)
      .map(([categoryTitle, nomineeName]) => ({
        electionTitle,
        categoryTitle,
        nomineeName,
      }));

    if (votes.length !== categories.length) {
      toast.error(`Please choose ${categories.length} nominees`);
      return;
    }

    formData.set("votes", JSON.stringify(votes));
    const result = await submitVotes(formData);

    if (result.error) {
      toast.error("Something went wrong! " + result.error);
    } else {
      toast.success("Voted successfully");
      setSelectedNominees({});
      setVoteSubmitted((prev) => prev + 1);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const result = await verifyElectionPassword(electionTitle, password);
    if (!result.valid) {
      setPasswordError(result.error || "Incorrect password");
      toast.error(result.error || "Incorrect password");
      return;
    }

    if (passwordAction === "results") {
      try {
        const result = await getElectionWinners(electionTitle);
        if (result.results) {
          const sortedResults = result.results.map((category) => ({
            ...category,
            nominees: [...category.nominees].sort((a, b) =>
              a.name === category.winner
                ? -1
                : b.name === category.winner
                ? 1
                : 0
            ),
          }));
          setResults(sortedResults);
          setShowResults(true);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to fetch results: " + error.message);
      }
    } else if (passwordAction === "admin") {
      setShowAdminPanel(true);
    } else if (passwordAction === "deleteElection") {
      const result = await deleteElection(electionTitle, password);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Election deleted successfully");
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      }
    }
    setShowPasswordModal(false);
    setPassword("");
    setPasswordError("");
  };

  const handleDeleteElection = () => {
    // setPasswordAction("deleteElection");
    // setShowPasswordModal(true);
  };

  if (!electionTitle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col items-center p-4 text-white overflow-x-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <ElectionHeader
        electionTitle={electionTitle}
        setPasswordAction={setPasswordAction}
        setShowPasswordModal={setShowPasswordModal}
        handleDeleteElection={handleDeleteElection}
      />
      <VotingForm
        categories={categories}
        selectedNominees={selectedNominees}
        handleSelectNominee={handleSelectNominee}
        handleSubmit={handleSubmit}
        voterCount={voterCount}
      />
      {showPasswordModal && (
        <PasswordModal
          password={password}
          setPassword={setPassword}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
          handlePasswordSubmit={handlePasswordSubmit}
          setShowPasswordModal={setShowPasswordModal}
        />
      )}
      {showAdminPanel && (
        <AdminPanel
          electionTitle={electionTitle}
          categories={categories}
          setCategories={setCategories}
          setShowAdminPanel={setShowAdminPanel}
          supabase={supabase}
        />
      )}
      {showResults && (
        <ResultsPanel
          results={results}
          setShowResults={setShowResults}
          electionTitle={electionTitle}
        />
      )}
    </div>
  );
}
