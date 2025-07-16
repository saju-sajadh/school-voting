import NomineeButton from "./nomineeButton";

export default function CategoryCard({ category, selectedNominees, handleSelectNominee }) {
  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-lg p-4 sm:p-5 rounded-2xl shadow-xl border border-purple-300 border-opacity-30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-center mb-3 sm:mb-4 text-yellow-600">
        {category.title}
      </h2>
      <div className="flex flex-col space-y-2">
        {category.nominees.map((nominee, idx) => (
          <NomineeButton
            key={idx}
            nominee={nominee}
            categoryTitle={category.title}
            selectedNominees={selectedNominees}
            handleSelectNominee={handleSelectNominee}
          />
        ))}
      </div>
    </div>
  );
}