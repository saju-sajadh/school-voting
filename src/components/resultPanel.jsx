import Image from "next/image";

export default function ResultsPanel({
  results,
  setShowResults,
  electionTitle,
}) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex items-start sm:items-center justify-center z-50 animate-fade-in overflow-y-auto py-4 sm:py-0">
      <div className="bg-white bg-opacity-30 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-3xl w-full max-w-lg sm:max-w-2xl md:max-w-3xl mx-4 shadow-2xl border border-yellow-300 border-opacity-50 transform animate-slide-up">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-4 sm:mb-6 text-yellow-500 animate-pulse">
          Election Results - {electionTitle}
        </h2>
        <div className="space-y-4 sm:space-y-6">
          {results.map((category, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-20 p-4 sm:p-5 rounded-xl shadow-lg border border-purple-300 border-opacity-30"
            >
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-center mb-2 sm:mb-3 text-purple-600">
                {category.title}
              </h3>
              <div className="space-y-2">
                {[...category.nominees]
                  .sort((a, b) => b.votes - a.votes) // Sort by votes in descending order
                  .map((nominee, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-300 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 scale-105"
                       "
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Image
                          src={nominee.photo || "/default-photo.jpg"}
                          alt={`${nominee.name}'s photo`}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                        <Image
                          src={nominee.logo || "/default-logo.jpg"}
                          alt={`${nominee.name}'s logo`}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
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
  );
}
