import Image from "next/image";

export default function NomineeButton({
  nominee,
  categoryTitle,
  selectedNominees,
  handleSelectNominee,
}) {
  return (
    <button
      type="button"
      onClick={() => handleSelectNominee(categoryTitle, nominee.name)}
      className={`w-full flex items-center justify-between space-x-2 sm:space-x-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-[14px] px-3 sm:px-4 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 transform hover:scale-105 ${
        selectedNominees[categoryTitle] === nominee.name
          ? "ring-2 ring-green-400"
          : ""
      }`}
      aria-label={`Select ${nominee.name} for ${categoryTitle}`}
    >
      <div className="flex items-center space-x-2 sm:space-x-3">
        <img
          src={nominee.photo ?? "/default-photo.jpg"}
          alt={`${nominee.name}'s photo`}
          width="32"
          height="32"
          className="rounded-full object-cover"
          style={{ width: "32px", height: "32px" }}
        />
        <span className="text-sm sm:text-base">{nominee.name}</span>
        <img
          src={nominee.logo ?? "/default-logo.jpg"}
          alt={`${nominee.name}'s logo`}
          width="32"
          height="32"
          className="rounded-full object-cover"
          style={{ width: "32px", height: "32px" }}
        />
      </div>
      <div
        className={`w-4 h-2 sm:w-6 sm:h-3 rounded-full transition-all duration-300 ${
          selectedNominees[categoryTitle] === nominee.name
            ? "bg-green-400 shadow-[0_0_8px_#34d399] sm:shadow-[0_0_10px_#34d399]"
            : "bg-white"
        }`}
      ></div>
    </button>
  );
}
