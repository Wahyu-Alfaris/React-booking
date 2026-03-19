import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BookingTable from "../components/BookingTable";
import { bookingAPI } from "../services/api";

export default function Dashboard({ user, onLogout }) {
  const [lapangan, setLapangan] = useState("Futsal A");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [noWa, setNoWa] = useState("");
  const [filterLapangan, setFilterLapangan] = useState("Semua");
  const [notification, setNotification] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    if (user.role === 'admin') {
      fetchStats();
    }
  }, []);

  const fetchBookings = async () => {
  try {
    setLoading(true);
    // Panggil API untuk mendapatkan SEMUA BOOKING
    const response = await bookingAPI.getAll();
    
    console.log("Data dari API:", response.data); // UNTUK DEBUG
    
    if (response.data.success) {
      // Transform data - INI AKAN MENGAMBIL SEMUA BOOKING DARI SEMUA USER
      const transformedData = response.data.data.map(booking => ({
        id: booking.id,
        lapangan: booking.lapangan,
        tanggal: booking.tanggal,
        jam: booking.jam,
        noWa: booking.no_wa,
        userName: booking.user.name,
        userId: booking.user_id,
        status: booking.status
      }));
      
      // SET STATE DENGAN SEMUA BOOKING
      setBookings(transformedData);
    }
  } catch (error) {
    showNotification("Gagal memuat data", 'error');
  } finally {
    setLoading(false);
  }
};

  const fetchStats = async () => {
    try {
      const response = await bookingAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat statistik:", error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 1500);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!tanggal || !jam || !noWa) {
      showNotification("Harap pilih tanggal, jam, dan isi nomor WhatsApp", 'error');
      return;
    }

    const noWaRegex = /^[0-9]{10,13}$/;
    if (!noWaRegex.test(noWa.replace(/\D/g, ''))) {
      showNotification("Nomor WhatsApp tidak valid (10-13 digit)", 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await bookingAPI.create({
        lapangan,
        tanggal,
        jam,
        no_wa: noWa
      });

      if (response.data.success) {
        showNotification("✅ Booking berhasil!", 'success');
        fetchBookings();
        if (user.role === 'admin') fetchStats();
        
        setLapangan("Futsal A");
        setTanggal("");
        setJam("");
        setNoWa("");
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Booking gagal", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus booking ini?")) {
      try {
        const response = await bookingAPI.delete(id);
        if (response.data.success) {
          showNotification("Booking dihapus", 'success');
          fetchBookings();
          if (user.role === 'admin') fetchStats();
        }
      } catch (error) {
        showNotification("Gagal menghapus booking", 'error');
      }
    }
  };

  const handleConfirm = async (id) => {
    try {
      const response = await bookingAPI.confirm(id);
      if (response.data.success) {
        showNotification("Booking dikonfirmasi", 'success');
        fetchBookings();
        if (user.role === 'admin') fetchStats();
      }
    } catch (error) {
      showNotification("Gagal mengkonfirmasi booking", 'error');
    }
  };

  const handleEdit = async (id, data) => {
    const booking = bookings.find(b => b.id === id);
    if (user.role !== 'admin' && booking?.userId !== user.id) {
      showNotification("Anda tidak berhak mengedit booking ini", 'error');
      return;
    }

    try {
      const response = await bookingAPI.update(id, {
        lapangan: data.lapangan,
        tanggal: data.tanggal,
        jam: data.jam,
        no_wa: data.noWa
      });
      
      if (response.data.success) {
        showNotification("Booking berhasil diupdate", 'success');
        fetchBookings();
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Gagal mengupdate", 'error');
    }
  };

  const Notification = ({ notification }) => {
    if (!notification) return null;
    return (
      <div className={`fixed top-20 right-4 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded shadow-lg z-50 animate-slideIn`}>
        {notification.message}
      </div>
    );
  };

  const AdminStats = () => {
    if (!stats) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total Booking</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Confirmed</div>
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Lapangan Tersedia</div>
          <div className="text-2xl font-bold text-blue-600">{stats.lapangan_tersedia}</div>
        </div>
      </div>
    );
  };

  const styles = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slideIn {
      animation: slideIn 0.15s ease-out;
    }
  `;

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{styles}</style>

      <Navbar user={user} onLogout={onLogout} />
      
      <Notification notification={notification} />

      <div className="p-6 max-w-4xl mx-auto">
        
        {/* Admin Statistics */}
        {user.role === "admin" && <AdminStats />}

        {/* User Booking Form */}
        {user.role === "user" && (
          <form onSubmit={handleBooking} className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-lg mb-3">🏸 Booking Lapangan</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Lapangan</label>
                <select 
                  className="border p-2 w-full rounded mt-1" 
                  value={lapangan} 
                  onChange={(e) => setLapangan(e.target.value)}
                >
                  <option>Futsal A</option>
                  <option>Futsal B</option>
                  <option>Badminton A</option>
                  <option>Badminton B</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tanggal</label>
                <input 
                  type="date" 
                  className="border p-2 w-full rounded mt-1" 
                  value={tanggal} 
                  min={new Date().toISOString().split('T')[0]} 
                  onChange={(e) => setTanggal(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Jam (08:00-22:00)</label>
                <input 
                  type="time" 
                  className="border p-2 w-full rounded mt-1" 
                  value={jam} 
                  min="08:00" 
                  max="22:00" 
                  onChange={(e) => setJam(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">No. WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="081234567890" 
                  className="border p-2 w-full rounded mt-1" 
                  value={noWa} 
                  onChange={(e) => setNoWa(e.target.value)} 
                  required 
                />
              </div>
              <div className="col-span-2">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Booking Now'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ALL SCHEDULES - SEMUA USER BISA LIHAT */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold text-lg mb-3">📅 Semua Jadwal Lapangan</h2>
          
          <div className="mb-3 flex gap-4 items-center">
            <select
              className="border p-2 rounded"
              value={filterLapangan}
              onChange={(e) => setFilterLapangan(e.target.value)}
            >
              <option>Semua</option>
              <option>Futsal A</option>
              <option>Futsal B</option>
              <option>Badminton A</option>
              <option>Badminton B</option>
            </select>
            <span className="text-sm text-gray-600">
              Total: {bookings.length} jadwal
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bookings
              .filter(b => filterLapangan === "Semua" || b.lapangan === filterLapangan)
              .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal) || a.jam.localeCompare(b.jam))
              .map(booking => (
                <div key={booking.id} className="border-b last:border-0 py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{booking.lapangan}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span>{new Date(booking.tanggal).toLocaleDateString('id-ID')}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span>{booking.jam} WIB</span>
                    <span className="ml-2 text-sm text-gray-600">- {booking.userName}</span>
                    {booking.userId === user.id && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                        Saya
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                  </span>
                </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-center text-gray-500 py-4">Belum ada jadwal booking</p>
            )}
          </div>
        </div>

        {/* Booking Table - Hanya untuk booking sendiri (user) atau semua (admin) */}
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-3">
            {user.role === "admin" ? "📋 Semua Data Booking" : "📋 Booking Saya"}
          </h2>
          {loading && <p className="text-center text-gray-500">Loading...</p>}
          <BookingTable
            bookings={user.role === "admin" ? bookings : bookings.filter(b => b.userId === user.id)}
            user={user}
            onDelete={handleDelete}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            currentUserId={user.id}
          />
        </div>
      </div>
    </div>
  );
}