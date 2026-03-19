import { useState } from "react";

export default function BookingTable({ bookings, user, onDelete, onConfirm, onEdit, currentUserId }) {
  const [editId, setEditId] = useState(null);
  const [lapangan, setLapangan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [noWa, setNoWa] = useState("");
  
  const [filterStatus, setFilterStatus] = useState("semua");
  const [searchName, setSearchName] = useState("");

  const startEdit = (booking) => {
    setEditId(booking.id);
    setLapangan(booking.lapangan);
    setTanggal(booking.tanggal);
    setJam(booking.jam);
    setNoWa(booking.noWa || "");
  };

  const handleSave = () => {
    onEdit(editId, { lapangan, tanggal, jam, noWa });
    setEditId(null);
  };

  const handleCancel = () => {
    setEditId(null);
  };

  const formatNoWa = (noWa) => {
    if (!noWa) return "-";
    const cleaned = noWa.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0,4)}-${cleaned.slice(4,8)}-${cleaned.slice(8)}`;
    } else if (cleaned.length === 12) {
      return `${cleaned.slice(0,4)}-${cleaned.slice(4,8)}-${cleaned.slice(8,12)}`;
    } else if (cleaned.length === 13) {
      return `${cleaned.slice(0,4)}-${cleaned.slice(4,8)}-${cleaned.slice(8,13)}`;
    }
    return noWa;
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus !== "semua" && booking.status !== filterStatus) return false;
    if (searchName && !booking.userName.toLowerCase().includes(searchName.toLowerCase())) return false;
    return true;
  });

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded shadow">
        <p className="text-gray-500">Belum ada booking</p>
        {user.role === "user" && (
          <p className="text-sm text-gray-400 mt-2">Silakan booking lapangan di atas</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {user.role === "admin" && (
        <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm text-gray-600 mr-2">Filter Status:</label>
            <select 
              className="border p-1 rounded" 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="pending">Pending ⏳</option>
              <option value="confirmed">Confirmed ✓</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-gray-600 mr-2">Cari Pemesan:</label>
            <input 
              type="text" 
              placeholder="Nama pemesan..." 
              className="border p-1 rounded w-full" 
              value={searchName} 
              onChange={(e) => setSearchName(e.target.value)} 
            />
          </div>
          <div className="text-sm text-gray-600">
            Menampilkan {filteredBookings.length} dari {bookings.length} booking
          </div>
        </div>
      )}

      {filteredBookings.map((booking) => {
        const isOwnBooking = booking.userId === currentUserId;
        
        return (
          <div key={booking.id} className="bg-white p-4 rounded shadow flex justify-between hover:shadow-md transition">
            <div className="flex-1">
              {editId === booking.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <select 
                      className="border p-1 rounded" 
                      value={lapangan} 
                      onChange={(e) => setLapangan(e.target.value)}
                    >
                      <option>Futsal A</option>
                      <option>Futsal B</option>
                      <option>Badminton A</option>
                      <option>Badminton B</option>
                    </select>
                    <input 
                      type="date" 
                      className="border p-1 rounded" 
                      value={tanggal} 
                      min={new Date().toISOString().split('T')[0]} 
                      onChange={(e) => setTanggal(e.target.value)} 
                    />
                    <input 
                      type="time" 
                      className="border p-1 rounded" 
                      value={jam} 
                      min="08:00" 
                      max="22:00" 
                      onChange={(e) => setJam(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">No. WhatsApp</label>
                    <input 
                      type="tel" 
                      placeholder="081234567890" 
                      className="border p-1 rounded w-full max-w-xs" 
                      value={noWa} 
                      onChange={(e) => setNoWa(e.target.value)} 
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">{booking.lapangan}</h3>
                    {booking.status === "pending" ? (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">⏳ Pending</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">✓ Confirmed</span>
                    )}
                    {isOwnBooking && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">Booking Saya</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <p className="text-gray-600"><span className="font-medium">Pemesan:</span> {booking.userName}</p>
                    <p className="text-gray-600">
                      <span className="font-medium">No. WA:</span>{' '}
                      {booking.noWa ? (
                        <a 
                          href={`https://wa.me/${booking.noWa.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-600 hover:text-green-700 hover:underline"
                        >
                          {formatNoWa(booking.noWa)} 💬
                        </a>
                      ) : '-'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Tanggal:</span>{' '}
                      {new Date(booking.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600"><span className="font-medium">Jam:</span> {booking.jam} WIB</p>
                  </div>

                  {user.role === "user" && booking.status === "pending" && isOwnBooking && (
                    <p className="text-xs text-yellow-600 mt-2">⏳ Menunggu konfirmasi admin</p>
                  )}
                </>
              )}
            </div>

            {(user.role === "admin" || isOwnBooking) && (
              <div className="flex flex-col gap-2 ml-4">
                {editId === booking.id ? (
                  <>
                    <button onClick={handleSave} className="text-green-600 hover:text-green-700 font-medium">💾 Simpan</button>
                    <button onClick={handleCancel} className="text-gray-600 hover:text-gray-700 font-medium">✕ Batal</button>
                  </>
                ) : (
                  <>
                    {user.role === "admin" && booking.status !== "confirmed" && (
                      <button onClick={() => onConfirm(booking.id)} className="text-green-600 hover:text-green-700 font-medium">✓ Konfirmasi</button>
                    )}
                    {(user.role === "admin" || isOwnBooking) && (
                      <button onClick={() => startEdit(booking)} className="text-blue-600 hover:text-blue-700 font-medium">✎ Edit</button>
                    )}
                    {(user.role === "admin" || isOwnBooking) && (
                      <button onClick={() => onDelete(booking.id)} className="text-red-600 hover:text-red-700 font-medium">🗑 Hapus</button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {filteredBookings.length === 0 && bookings.length > 0 && (
        <div className="text-center py-8 bg-white rounded shadow">
          <p className="text-gray-500">Tidak ada booking yang sesuai filter</p>
          <button 
            onClick={() => { setFilterStatus("semua"); setSearchName(""); }} 
            className="text-blue-600 mt-2 text-sm hover:underline"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
}