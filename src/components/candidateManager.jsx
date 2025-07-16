"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import { addCandidate, updateCandidate, deleteCandidate } from "@/actions/server";
import Image from "next/image";

export default function CandidateManager({
  electionTitle,
  categories,
  setCategories,
  supabase,
  handleDeleteCategory,
}) {
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    category: "",
    photo: null,
    logo: null,
  });
  const [editingCandidate, setEditingCandidate] = useState(null);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (
      !newCandidate.name ||
      !newCandidate.category ||
      !newCandidate.photo ||
      !newCandidate.logo
    ) {
      toast.error("Please provide candidate name, category, photo, and logo");
      return;
    }

    if (!supabase) {
      toast.error("Storage service is not initialized");
      return;
    }

    try {
      const result = await addCandidate({
        electionTitle,
        categoryTitle: newCandidate.category,
        candidateName: newCandidate.name,
        photoFile: newCandidate.photo,
        logoFile: newCandidate.logo,
      });

      if (result.error) {
        toast.error("Failed to add candidate: " + result.error);
      } else {
        // Assume addCandidate returns an object with photoUrl and logoUrl
        const { photoUrl, logoUrl } = result; // Adjust based on actual response structure

        setCategories(
          categories.map((category) =>
            category.title === newCandidate.category
              ? {
                  ...category,
                  nominees: [
                    ...category.nominees,
                    {
                      name: newCandidate.name,
                      photo: photoUrl || '/loading.png', // Use the URL or fallback
                      logo: logoUrl || '/loading.png',   // Use the URL or fallback
                      votes: 0,
                    },
                  ],
                }
              : category
          )
        );
        setNewCandidate({ name: "", category: "", photo: null, logo: null });
        toast.success("Candidate added successfully");
      }
    } catch (error) {
      console.error("Error in handleAddCandidate:", error);
      toast.error("Failed to add candidate: " + error.message);
    }
  };

  // ... (rest of the handleUpdateCandidate and handleDeleteCandidate functions remain unchanged)

  return (
    <>
      <form onSubmit={handleAddCandidate} className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-purple-600">
          Add New Candidate
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={newCandidate.name}
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, name: e.target.value })
            }
            placeholder="Candidate Name"
            className="p-2 rounded-lg border text-gray-900"
          />
          <select
            value={newCandidate.category}
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, category: e.target.value })
            }
            className="p-2 rounded-lg border text-gray-900"
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category.title}>
                {category.title}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, photo: e.target.files[0] })
            }
            className="p-2 rounded-lg border text-gray-900"
            aria-label="Upload candidate photo"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, logo: e.target.files[0] })
            }
            className="p-2 rounded-lg border text-gray-900"
            aria-label="Upload candidate logo"
          />
        </div>
        <button
          type="submit"
          className="mt-2 bg-gradient-to-r from-green-400 to-teal-400 text-gray-900 px-4 py-2 rounded-full"
        >
          Add Candidate
        </button>
      </form>
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="bg-white bg-opacity-20 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-purple-600">
                {category.title}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setEditingCategory({
                      originalTitle: category.title,
                      newTitle: category.title,
                    })
                  }
                  className="p-2 bg-blue-400 rounded-full"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.title)}
                  className="p-2 bg-red-400 rounded-full"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            {category.nominees.map((nominee, idx) => (
              <div key={idx} className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <Image
                    src={nominee.photo || '/loading.png'} // Use || instead of ?? for clarity
                    alt={`${nominee.name}'s photo`}
                    width={28}
                    height={32}
                    className="rounded object-cover"
                  />
                  <Image
                    src={nominee.logo || '/loading.png'} // Use || instead of ?? for clarity
                    alt={`${nominee.name}'s logo`}
                    width={32}
                    height={32}
                    className="rounded object-cover"
                  />
                  <span className="text-black font-bold">{nominee.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setEditingCandidate({
                        ...nominee,
                        categoryTitle: category.title,
                        originalName: nominee.name,
                        newPhoto: null,
                        newLogo: null,
                      })
                    }
                    className="p-2 bg-blue-400 rounded-full"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCandidate(category.title, nominee.name)}
                    className="p-2 bg-red-400 rounded-full"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {editingCandidate && (
        <form onSubmit={handleUpdateCandidate} className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-purple-600">
            Edit Candidate
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={editingCandidate.name}
              onChange={(e) =>
                setEditingCandidate({ ...editingCandidate, name: e.target.value })
              }
              placeholder="Candidate Name"
              className="p-2 rounded-lg border text-gray-900"
            />
            <div className="flex flex-col space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditingCandidate({
                    ...editingCandidate,
                    newPhoto: e.target.files[0],
                  })
                }
                className="p-2 rounded-lg border text-gray-900"
                aria-label="Upload new candidate photo"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditingCandidate({
                    ...editingCandidate,
                    newLogo: e.target.files[0],
                  })
                }
                className="p-2 rounded-lg border text-gray-900"
                aria-label="Upload new candidate logo"
              />
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-400 to-teal-400 text-gray-900 px-4 py-2 rounded-full"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setEditingCandidate(null)}
              className="bg-gradient-to-r from-red-400 to-pink-400 text-gray-900 px-4 py-2 rounded-full"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </>
  );
}