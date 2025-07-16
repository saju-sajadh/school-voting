export default function PasswordModal({
  password,
  setPassword,
  passwordError,
  setPasswordError,
  handlePasswordSubmit,
  setShowPasswordModal,
}) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-30 backdrop-blur-xl p-6 rounded-3xl w-full max-w-md mx-4 shadow-2xl border border-yellow-300 border-opacity-50">
        <h2 className="text-xl font-bold text-center mb-4 text-yellow-500">
          Enter Election Password
        </h2>
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-lg border text-gray-900 mb-4"
            placeholder="Password"
            aria-label="Election password"
          />
          {passwordError && (
            <p className="text-red-500 text-sm mb-4">{passwordError}</p>
          )}
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-400 to-teal-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-green-300 hover:to-teal-300 transition-all duration-300"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setPassword("");
                setPasswordError("");
              }}
              className="bg-gradient-to-r from-red-400 to-pink-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-red-300 hover:to-pink-300 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}