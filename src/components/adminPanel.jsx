'use client'

import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import CategoryManager from "./categoryManager";
import CandidateManager from "./candidateManager";
import { addCategory, updateCategory, deleteCategory,  } from "@/actions/server";

export default function AdminPanel({ electionTitle, categories, setCategories, setShowAdminPanel, supabase }) {
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryPassword, setNewCategoryPassword] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory || !newCategoryPassword) {
      toast.error("Please enter both category title and election password");
      return;
    }

    const result = await addCategory(electionTitle, newCategory, newCategoryPassword);
    if (result.error) {
      toast.error("Failed to add category: " + result.error);
    } else {
      setCategories([...categories, { title: newCategory, nominees: [] }]);
      setNewCategory("");
      setNewCategoryPassword("");
      toast.success("Category added successfully");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.newTitle || !newCategoryPassword) {
      toast.error("Please enter both new category title and election password");
      return;
    }

    const result = await updateCategory({
      electionTitle,
      originalCategoryTitle: editingCategory.originalTitle,
      newCategoryTitle: editingCategory.newTitle,
      password: newCategoryPassword,
    });

    if (result.error) {
      toast.error("Failed to update category: " + result.error);
    } else {
      setCategories(
        categories.map((category) =>
          category.title === editingCategory.originalTitle
            ? { ...category, title: editingCategory.newTitle }
            : category
        )
      );
      setEditingCategory(null);
      setNewCategoryPassword("");
      toast.success("Category updated successfully");
    }
  };

  const handleDeleteCategory = async (categoryTitle) => {
    if (!newCategoryPassword) {
      toast.error("Please enter the election password to delete the category");
      return;
    }
    const result = await deleteCategory(electionTitle, categoryTitle, newCategoryPassword);
    if (result.error) {
      toast.error("Failed to delete category: " + result.error);
    } else {
      setCategories(categories.filter((category) => category.title !== categoryTitle));
      setNewCategoryPassword("");
      toast.success("Category deleted successfully");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex items-start sm:items-center justify-center z-50 overflow-y-auto py-4 sm:py-0">
      <div className="bg-white bg-opacity-30 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-3xl w-full max-w-lg sm:max-w-2xl md:max-w-3xl mx-4 shadow-2xl border border-yellow-300 border-opacity-50">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-4 sm:mb-6 text-yellow-500">
          Admin Panel - {electionTitle}
        </h2>
        <CategoryManager
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          newCategoryPassword={newCategoryPassword}
          setNewCategoryPassword={setNewCategoryPassword}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          handleAddCategory={handleAddCategory}
          handleUpdateCategory={handleUpdateCategory}
        />
        <CandidateManager
          electionTitle={electionTitle}
          categories={categories}
          setCategories={setCategories}
          supabase={supabase}
          handleDeleteCategory={handleDeleteCategory}
        />
        <div className="flex justify-center mt-4 sm:mt-8">
          <button
            onClick={() => setShowAdminPanel(false)}
            className="bg-gradient-to-r from-red-400 to-pink-400 text-gray-900 px-6 py-2 sm:px-8 sm:py-3 rounded-full font-semibold hover:from-red-300 hover:to-pink-300 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            aria-label="Close admin panel"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}