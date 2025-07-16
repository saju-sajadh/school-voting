import CategoryCard from "./categoryCard";

export default function VotingForm({ categories, selectedNominees, handleSelectNominee, handleSubmit, voterCount }) {
  return (
    <form action={handleSubmit} className="w-full max-w-3xl">
      <div className="grid grid-cols-1 gap-4">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            category={category}
            selectedNominees={selectedNominees}
            handleSelectNominee={handleSelectNominee}
          />
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
          votes: {voterCount}
        </div>
      </div>
    </form>
  );
}