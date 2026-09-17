import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000';

function App() {
  const [orchids, setOrchids] = useState([]);
  const [selectedOrchid, setSelectedOrchid] = useState(null);
  const [newOrchid, setNewOrchid] = useState({ name: '', category: '', description: '' });

// State lưu đối tượng đang chỉnh sửa (PUT)
  const [editingOrchid, setEditingOrchid] = useState(null);

  const [feedbacks, setFeedbacks] = useState([]);

// Log HTTP status trực tiếp ra Console
  const logStatus = (action, status, ok, message = '') => {
    if (ok) {
      console.log(`%c[HTTP SUCCESS] ${action} - Status Code: ${status} ${message}`, 'color: green; font-weight: bold;');
    } else {
      console.error(`%c[HTTP ERROR] ${action} - Status Code: ${status} ${message}`, 'color: red; font-weight: bold;');
    }
  };

// 1. GET - Lấy danh sách Orchids (Không try-catch)
  const fetchOrchids = async () => {
    const response = await fetch(`${API_BASE}/orchids`);
    logStatus('GET /orchids', response.status, response.ok);
    const data = await response.json();
    setOrchids(data);
  };

// GET - Lấy danh sách Feedbacks
  const fetchFeedbacks = async () => {
    const response = await fetch(`${API_BASE}/feedback`);
    logStatus('GET /feedback', response.status, response.ok);
    const data = await response.json();
    setFeedbacks(data);
  };

  useEffect(() => {
    fetchOrchids();
    fetchFeedbacks();
  }, []);

// 2. POST - Thêm Orchid mới (Báo lỗi 403 Forbidden nếu để trống thông tin)
  const handleAddOrchid = async (e) => {
    e.preventDefault();

// Kiểm tra nếu nhập thiếu field -> Báo thẳng lỗi 403 Forbidden
    if (!newOrchid.name.trim() || !newOrchid.category.trim() || !newOrchid.description.trim()) {
      const statusCode = 403;
      logStatus('POST /orchids', statusCode, false, '(Forbidden - Thiếu thông tin)');
      alert(`[HTTP ${statusCode} Forbidden]: Bị từ chối! Bạn không được để trống thông tin.`);
      return;
    }

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


  };

// 3. GET - Xem chi tiết 1 Orchid (Báo lỗi 404 Not Found nếu không tồn tại)
  const handleGetDetail = async (id) => {
    const response = await fetch(`${API_BASE}/orchids/${id}`);
    logStatus(`GET /orchids/${id}`, response.status, response.ok);

    if (response.status === 404 || !response.ok) {
      logStatus(`GET /orchids/${id}`, 404, false, '(Not Found)');
      alert(`[HTTP 404 Not Found]: Không tìm thấy Orchid ID ${id}!`);
      return;
    }

    const data = await response.json();
    setSelectedOrchid(data);


  };

// 4. Mở form chỉnh sửa khi bấm nút Sửa
  const handleStartEdit = (item) => {
    setEditingOrchid({ ...item });
  };

// 5. PUT - Cập nhật dữ liệu (Báo lỗi 400 Bad Request nếu sửa thành dữ liệu rỗng)
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editingOrchid) return;

// Kiểm tra nếu sửa dữ liệu rỗng -> Báo lỗi 400 Bad Request
    if (!editingOrchid.name.trim() || !editingOrchid.category.trim() || !editingOrchid.description.trim()) {
      const statusCode = 400;
      logStatus(`PUT /orchids/${editingOrchid.id}`, statusCode, false, '(Bad Request - Dữ liệu rỗng)');
      alert(`[HTTP ${statusCode} Bad Request]: Cập nhật thất bại! Dữ liệu không hợp lệ.`);
      return;
    }

    const response = await fetch(`${API_BASE}/orchids/${editingOrchid.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingOrchid),
    });

    logStatus(`PUT /orchids/${editingOrchid.id}`, response.status, response.ok);

    if (response.ok) {
      alert(`Cập nhật thành công! Status Code: ${response.status}`);
      setEditingOrchid(null);
      fetchOrchids();
      if (selectedOrchid && selectedOrchid.id === editingOrchid.id) {
        handleGetDetail(editingOrchid.id);
      }
    }


  };

// 6. DELETE - Xóa Orchid (Không try-catch)
  const handleDeleteOrchid = async (id) => {
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


  };

  return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        Demo Client-Server API (Không Try-Catch)
        Mở tab Console ở DevTools để kiểm tra các dòng log Status Code trực tiếp.


        {/* FORM CHỈNH SỬA (PUT) */}
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
                      style={{ padding: '5px', width: '250px' }}
                  />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'inline-block', width: '120px' }}>Phân loại: </label>
                  <input
                      type="text"
                      value={editingOrchid.category}
                      onChange={(e) => setEditingOrchid({ ...editingOrchid, category: e.target.value })}
                      style={{ padding: '5px', width: '250px' }}
                  />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'inline-block', width: '120px' }}>Mô tả: </label>
                  <input
                      type="text"
                      value={editingOrchid.description}
                      onChange={(e) => setEditingOrchid({ ...editingOrchid, description: e.target.value })}
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
            /* FORM THÊM MỚI (POST) - Thử xóa nội dung input để test lỗi 403 */
            <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
              <h2 style={{ marginTop: 0 }}>+ Thêm Orchid Mới (HTTP POST)</h2>
              <p style={{ color: '#666', fontSize: '14px' }}>* Thử để trống 1 ô bất kỳ và bấm Thêm để thấy thông báo lỗi <b>403 Forbidden</b>.</p>
              <form onSubmit={handleAddOrchid}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'inline-block', width: '120px' }}>Tên hoa: </label>
                  <input
                      type="text"
                      value={newOrchid.name}
                      onChange={(e) => setNewOrchid({ ...newOrchid, name: e.target.value })}
                      style={{ padding: '5px', width: '250px' }}
                  />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'inline-block', width: '120px' }}>Phân loại: </label>
                  <input
                      type="text"
                      value={newOrchid.category}
                      onChange={(e) => setNewOrchid({ ...newOrchid, category: e.target.value })}
                      style={{ padding: '5px', width: '250px' }}
                  />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'inline-block', width: '120px' }}>Mô tả: </label>
                  <input
                      type="text"
                      value={newOrchid.description}
                      onChange={(e) => setNewOrchid({ ...newOrchid, description: e.target.value })}
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

        {/* Bấm nút này để test trực tiếp xem lỗi 404 khi GET một ID không tồn tại */}
        <button
            onClick={() => handleGetDetail(999999)}
            style={{ marginBottom: '15px', backgroundColor: '#e91e63', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          🧪 Test thử GET ID không tồn tại (Lỗi 404)
        </button>

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