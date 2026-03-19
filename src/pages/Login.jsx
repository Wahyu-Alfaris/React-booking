// src/pages/Login.jsx
import { useState } from "react";
import { authAPI } from "../services/api";
import axios from "axios"; // <-- TAMBAHKAN IMPORT INI

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Komponen Notifikasi
  const Notification = ({ notification }) => {
    if (!notification) return null;
    
    const bgColor = notification.type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50 animate-slideIn`}>
        {notification.message}
      </div>
    );
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi form
    if (!name || !email || !password) {
      showNotification("Semua field harus diisi", 'error');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Format email tidak valid", 'error');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showNotification("Password minimal 6 karakter", 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({ name, email, password });
      
      if (response.data.success) {
        showNotification("Registrasi berhasil! Silakan login", 'success');
        setTimeout(() => {
          setIsRegister(false);
          setName("");
          setEmail("");
          setPassword("");
        }, 1500);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registrasi gagal";
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi form
    if (!email || !password) {
      showNotification("Email dan password harus diisi", 'error');
      setLoading(false);
      return;
    }

    try {
      // PANGGIL LANSUNG TANPA CSRF COOKIE (KARENA PAKAI SANCTUM)
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        // Simpan token dan user
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        showNotification(`Selamat datang, ${response.data.user.name}!`, 'success');
        
        setTimeout(() => {
          onLogin(response.data.user);
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle error response
      if (error.response) {
        // Server merespon dengan error
        showNotification(error.response.data?.message || "Login gagal", 'error');
      } else if (error.request) {
        // Tidak ada response dari server
        showNotification("Tidak dapat terhubung ke server", 'error');
      } else {
        // Error lainnya
        showNotification("Terjadi kesalahan", 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // CSS Animations
  const styles = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        
        <Notification notification={notification} />

        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 animate-fadeIn">
          
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏟️</div>
            <h1 className="text-2xl font-bold text-gray-800">
              SportArena Booking
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isRegister ? "Buat akun baru untuk mulai booking" : "Masuk ke akun Anda"}
            </p>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="contoh@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder={isRegister ? "Minimal 6 karakter" : "Masukkan password"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isRegister && (
                <p className="text-xs text-gray-500 mt-1">
                  Password minimal 6 karakter
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Loading...' : (isRegister ? "Daftar Akun" : "Masuk")}
            </button>
          </form>

          <div className="text-center mt-6">
            {isRegister ? (
              <button
                onClick={() => {
                  setIsRegister(false);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                Sudah punya akun? Masuk di sini
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsRegister(true);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                Belum punya akun? Daftar sekarang
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}