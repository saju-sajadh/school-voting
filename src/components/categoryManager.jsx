export default function CategoryManager({
  newCategory,
  setNewCategory,
  newCategoryPassword,
  setNewCategoryPassword,
  editingCategory,
  setEditingCategory,
  handleAddCategory,
  handleUpdateCategory,
}) {
  return (
    <>
      <form onSubmit={handleAddCategory} className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-purple-600">Add New Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category Title (e.g., Head Boy)"
            className="p-2 rounded-lg border text-gray-900"
          />
          <input
            type="password"
            value={newCategoryPassword}
            onChange={(e) => setNewCategoryPassword(e.target.value)}
            placeholder="Election Password"
            className="p-2 rounded-lg border text-gray-900"
          />
        </div>
        <button
          type="submit"
          className="mt-2 bg-gradient-to-r from-green-400 to-teal-400 text-gray-900 px-4 py-2 rounded-full"
        >
          Add Category
        </button>
      </form>
      {editingCategory && (
        <form onSubmit={handleUpdateCategory} className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-purple-600">Edit Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={editingCategory.newTitle}
              onChange={(e) => setEditingCategory({ ...editingCategory, newTitle: e.target.value })}
              placeholder="New Category Title"
              className="p-2 rounded-lg border text-gray-900"
            />
            <input
              type="password"
              value={newCategoryPassword}
              onChange={(e) => setNewCategoryPassword(e.target.value)}
              placeholder="Election Password"
              className="p-2 rounded-lg border text-gray-900"
            />
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
              onClick={() => {
                setEditingCategory(null);
                setNewCategoryPassword("");
              }}
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