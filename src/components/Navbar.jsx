// src/components/Navbar.jsx
export default function Navbar({ user, onLogout }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="font-bold text-xl">
          🏟️ BintangSport
        </h1>

        <div className="flex gap-4 items-center">
          <div className="text-right">
            <span className="block text-sm">{user.name}</span>
            <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">
              {user.role === "admin" ? "Administrator" : "Member"}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-100 transition shadow"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}