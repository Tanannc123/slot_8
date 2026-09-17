import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000';

function App() {
  const [orchids, setOrchids] = useState([]);
  const [selectedOrchid, setSelectedOrchid] = useState(null);
  const [newOrchid, setNewOrchid] = useState({ name: '', category: '', description: '' });

// State lưu đối tượng đang được chỉnh sửa
  const [editingOrchid, setEditingOrchid] = useState(null);

  const [feedbacks, setFeedbacks] = useState([]);
  const [feedback, setFeedback] = useState({ name: '', comment: '' });

// Log HTTP status ra Console
  const logStatus = (action, status, ok) => {
    if (ok) {
      console.log(`%c[HTTP SUCCESS] ${action} - Status Code: ${status}`, 'color: green; font-weight: bold;');
    } else {
      console.error(`%c[HTTP ERROR] ${action} - Status Code: ${status}`, 'color: red; font-weight: bold;');
    }
  };

// 1. GET - Lấy danh sách Orchids
  const fetchOrchids = async () => {
    try {
      const response = await fetch(`${API_BASE}/orchids`);
      logStatus('GET /orchids', response.status, response.ok);
      const data = await response.json();
      setOrchids(data);
    } catch (error) {
      console.error('Network error:', error);
    }
  };

// GET - Lấy danh sách Feedbacks
  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${API_BASE}/feedback`);
      logStatus('GET /feedback', response.status, response.ok);
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  useEffect(() => {
    fetchOrchids();
    fetchFeedbacks();
  }, []);

// 2. POST - Thêm Orchid mới
  const handleAddOrchid = async (e) => {
    e.preventDefault();
    if (!newOrchid.name || !newOrchid.category || !newOrchid.description) {
      alert('Lỗi 400: Thiếu dữ liệu! Vui lòng nhập đầy đủ Tên hoa, Phân loại và Mô tả.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/orchids`, {
      method: 'POST',
          headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrchid),
    });
    logStatus('POST /orchids', response.status, response.ok);
    if (response.ok) {
      alert(`Thêm mới thành công! Status Code: ${response.status}`);
      setNewOrchid({ name: '', category: '', description: '' });
      fetchOrchids();
    }
  } catch (error) {
    console.error('Lỗi POST:', error);
  }
};

// 3. GET - Xem chi tiết 1 Orchid
const handleGetDetail = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/orchids/${id}`);
    logStatus(`GET /orchids/${id}`, response.status, response.ok);
    if (response.status === 404) {
      alert('Lỗi 404: Không tìm thấy Orchid này!');
      return;
    }
    const data = await response.json();
    setSelectedOrchid(data);
  } catch (error) {
    console.error('Lỗi GET detail:', error);
  }
};

// 4. Mở form chỉnh sửa khi bấm nút Sửa
const handleStartEdit = (item) => {
  setEditingOrchid({ ...item });
};

// 5. PUT - Gửi dữ liệu đã cập nhật lên Server
const handleSaveUpdate = async (e) => {
  e.preventDefault();
  if (!editingOrchid) return;
  if (!editingOrchid.name || !editingOrchid.category || !editingOrchid.description) {
    alert('Lỗi 400: Thiếu dữ liệu! Vui lòng nhập đầy đủ Tên hoa, Phân loại và Mô tả.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orchids/${editingOrchid.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingOrchid),
    });
    logStatus(`PUT /orchids/${editingOrchid.id}`, response.status, response.ok);

    if (response.ok) {
      alert(`Cập nhật thành công! Status Code: ${response.status}`);
      setEditingOrchid(null); // Đóng form sửa
      fetchOrchids(); // Tải lại danh sách
      if (selectedOrchid && selectedOrchid.id === editingOrchid.id) {
        handleGetDetail(editingOrchid.id); // Cập nhật lại ô Chi tiết nếu đang mở
      }
    }
  } catch (error) {
    console.error('Lỗi PUT:', error);
  }


};

// 6. DELETE - Xóa Orchid
const handleDeleteOrchid = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/orchids/${id}`, {
      method: 'DELETE',
    });
    logStatus(`DELETE /orchids/${id}`, response.status, response.ok);

    if (response.ok) {
      alert(`Xóa thành công! Status Code: ${response.status}`);
      if (selectedOrchid && selectedOrchid.id === id) {
        setSelectedOrchid(null);
      }
      if (editingOrchid && editingOrchid.id === id) {
        setEditingOrchid(null);
      }
      fetchOrchids();
    }
  } catch (error) {
    console.error('Lỗi DELETE:', error);
  }


};

return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      Demo Client-Server API trong React
      Mở tab Console ở DevTools để xem chi tiết mã HTTP Status Code.


      {/* HIỂN THỊ FORM CHỈNH SỬA (KHI BẤM NÚT SỬA) */}
      {editingOrchid ? (
          <div style={{ marginBottom: '20px', border: '2px solid #2196F3', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
            <h2 style={{ marginTop: 0, color: '#1976D2' }}>✏️ Chỉnh Sửa Orchid (ID: {editingOrchid.id})</h2>
            <form onSubmit={handleSaveUpdate}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'inline-block', width: '120px' }}>Tên hoa: </label>
                <input
                    type="text"
                    value={editingOrchid.name}
                    onChange={(e) => setEditingOrchid({ ...editingOrchid, name: e.target.value })}
                    required
                    style={{ padding: '5px', width: '250px' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'inline-block', width: '120px' }}>Phân loại: </label>
                <input
                    type="text"
                    value={editingOrchid.category}
                    onChange={(e) => setEditingOrchid({ ...editingOrchid, category: e.target.value })}
                    required
                    style={{ padding: '5px', width: '250px' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'inline-block', width: '120px' }}>Mô tả: </label>
                <input
                    type="text"
                    value={editingOrchid.description}
                    onChange={(e) => setEditingOrchid({ ...editingOrchid, description: e.target.value })}
                    required
                    style={{ padding: '5px', width: '250px' }}
                />
              </div>
              <button
                  type="submit"
                  style={{ marginTop: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '6px 14px', cursor: 'pointer', marginRight: '8px' }}
              >
                Lưu thay đổi (PUT)
              </button>
              <button
                  type="button"
                  onClick={() => setEditingOrchid(null)}
                  style={{ marginTop: '10px', backgroundColor: '#757575', color: 'white', border: 'none', padding: '6px 14px', cursor: 'pointer' }}
              >
                Hủy
              </button>
            </form>
          </div>
      ) : (
          /* FORM THÊM MỚI (POST) */
          <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h2 style={{ marginTop: 0 }}>+ Thêm Orchid Mới (HTTP POST)</h2>
            <form onSubmit={handleAddOrchid}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'inline-block', width: '120px' }}>Tên hoa: </label>
                <input
                    type="text"
                    value={newOrchid.name}
                    onChange={(e) => setNewOrchid({ ...newOrchid, name: e.target.value })}
                    required
                    style={{ padding: '5px', width: '250px' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'inline-block', width: '120px' }}>Phân loại: </label>
                <input
                    type="text"
                    value={newOrchid.category}
                    onChange={(e) => setNewOrchid({ ...newOrchid, category: e.target.value })}
                    required
                    style={{ padding: '5px', width: '250px' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'inline-block', width: '120px' }}>Mô tả: </label>
                <input
                    type="text"
                    value={newOrchid.description}
                    onChange={(e) => setNewOrchid({ ...newOrchid, description: e.target.value })}
                    required
                    style={{ padding: '5px', width: '250px' }}
                />
              </div>
              <button
                  type="submit"
                  style={{ marginTop: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '6px 14px', cursor: 'pointer' }}
              >
                Thêm Hoa Mới (POST)
              </button>
            </form>
          </div>
      )}

      <hr />

      <h2>1. HTTP GET - Danh sách Orchids</h2>
      <ul style={{ paddingLeft: '20px' }}>
        {orchids.map((item) => (
            <li key={item.id} style={{ marginBottom: '12px' }}>
              <b>{item.name}</b> ({item.category})
              <button onClick={() => handleGetDetail(item.id)} style={{ marginLeft: '10px' }}>
                Xem chi tiết (GET)
              </button>
              <button
                  onClick={() => handleStartEdit(item)}
                  style={{ marginLeft: '5px', backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }}
              >
                Sửa (PUT)
              </button>
              <button onClick={() => handleDeleteOrchid(item.id)} style={{ marginLeft: '5px', color: 'red' }}>
                Xóa (DELETE)
              </button>
            </li>
        ))}
      </ul>

      {selectedOrchid && (
          <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0 }}>Chi tiết Orchid (ID: {selectedOrchid.id})</h3>
            <p><b>Tên:</b> {selectedOrchid.name}</p>
            <p><b>Mô tả:</b> {selectedOrchid.description}</p>
            <p><b>Phân loại:</b> {selectedOrchid.category}</p>
          </div>
      )}
    </div>


);
}

export default App;