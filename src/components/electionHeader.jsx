import { FaTrophy, FaEdit, FaTrash } from "react-icons/fa";

export default function ElectionHeader({ electionTitle, setPasswordAction, setShowPasswordModal, handleDeleteElection }) {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 text-center animate-fade-in max-w-7xl">
        {electionTitle}
      </h1>
      <div className="fixed top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={() => {
            setPasswordAction("results");
            setShowPasswordModal(true);
          }}
          className="p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
          aria-label="Show election results"
        >
          <FaTrophy size={20} className="sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={() => {
            setPasswordAction("admin");
            setShowPasswordModal(true);
          }}
          className="p-2 sm:p-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-gray-900 rounded-full hover:from-blue-300 hover:to-indigo-300 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
          aria-label="Open admin panel"
        >
          <FaEdit size={20} className="sm:w-6 sm:h-6" />
        </button>       
      </div>
    </>
  );
}