// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hk4',
  password: '02032005',
  port: 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// AUTH
app.post('/api/register', async (req, res) => {
  const { ten_dang_nhap, email, mat_khau, vai_tro } = req.body;
  const hashedPassword = await bcrypt.hash(mat_khau, 10);
  try {
    const result = await pool.query(
      'INSERT INTO nguoi_dung (ten_dang_nhap, email, mat_khau_hash, vai_tro, tao_luc) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [ten_dang_nhap, email, hashedPassword, vai_tro]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { ten_dang_nhap, mat_khau } = req.body;
  try {
    const result = await pool.query('SELECT * FROM nguoi_dung WHERE ten_dang_nhap = $1', [ten_dang_nhap]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(mat_khau, user.mat_khau_hash))) {
      return res.status(401).json({ error: 'Sai thông tin đăng nhập' });
    }
    const token = jwt.sign({ id: user.id, vai_tro: user.vai_tro }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM nguoi_dung WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/:id', async (req, res) => {
  const { ten_dang_nhap, email } = req.body;
  try {
    await pool.query('UPDATE nguoi_dung SET ten_dang_nhap = $1, email = $2 WHERE id = $3', [ten_dang_nhap, email, req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// STORE
app.post('/api/store', async (req, res) => {
  const { nguoi_dung_id, ten_cua_hang, mo_ta, dia_chi } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cua_hang (nguoi_dung_id, ten_cua_hang, mo_ta, dia_chi, tao_luc) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [nguoi_dung_id, ten_cua_hang, mo_ta, dia_chi]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/store/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cua_hang WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/:id/store', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cua_hang WHERE nguoi_dung_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/store/:id', async (req, res) => {
  const { ten_cua_hang, mo_ta, dia_chi } = req.body;
  try {
    await pool.query('UPDATE cua_hang SET ten_cua_hang = $1, mo_ta = $2, dia_chi = $3 WHERE id = $4', [ten_cua_hang, mo_ta, dia_chi, req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PRODUCT
app.post('/api/product', async (req, res) => {
  const { cua_hang_id, ten, mo_ta, gia, danh_muc, duong_dan_anh } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO san_pham (cua_hang_id, ten, mo_ta, gia, danh_muc, duong_dan_anh, tao_luc) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [cua_hang_id, ten, mo_ta, gia, danh_muc, duong_dan_anh]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/product/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM san_pham WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/store/:id/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM san_pham WHERE cua_hang_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/product/:id', async (req, res) => {
  const { ten, mo_ta, gia, danh_muc, duong_dan_anh } = req.body;
  try {
    await pool.query('UPDATE san_pham SET ten = $1, mo_ta = $2, gia = $3, danh_muc = $4, duong_dan_anh = $5 WHERE id = $6', [ten, mo_ta, gia, danh_muc, duong_dan_anh, req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/product/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM san_pham WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// INVENTORY
app.post('/api/product/:id/inventory', async (req, res) => {
  const { kich_co, so_luong } = req.body;
  try {
    const result = await pool.query('INSERT INTO ton_kho (san_pham_id, kich_co, so_luong) VALUES ($1, $2, $3) RETURNING *', [req.params.id, kich_co, so_luong]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/product/:id/inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ton_kho WHERE san_pham_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const { so_luong } = req.body;
  try {
    await pool.query('UPDATE ton_kho SET so_luong = $1 WHERE id = $2', [so_luong, req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ORDER
app.post('/api/order', async (req, res) => {
  const { nguoi_dung_id, tong_tien, trang_thai, chi_tiet } = req.body; // chi_tiet = [{san_pham_id, kich_co, so_luong, gia}]
  try {
    const order = await pool.query('INSERT INTO don_hang (nguoi_dung_id, ngay_dat, tong_tien, trang_thai) VALUES ($1, NOW(), $2, $3) RETURNING *', [nguoi_dung_id, tong_tien, trang_thai]);
    const orderId = order.rows[0].id;
    for (const item of chi_tiet) {
      await pool.query('INSERT INTO chi_tiet_don_hang (don_hang_id, san_pham_id, kich_co, so_luong, gia) VALUES ($1, $2, $3, $4, $5)', [orderId, item.san_pham_id, item.kich_co, item.so_luong, item.gia]);
    }
    res.json(order.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/order/:id', async (req, res) => {
  try {
    const order = await pool.query('SELECT * FROM don_hang WHERE id = $1', [req.params.id]);
    const items = await pool.query('SELECT * FROM chi_tiet_don_hang WHERE don_hang_id = $1', [req.params.id]);
    res.json({ ...order.rows[0], chi_tiet: items.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/:id/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM don_hang WHERE nguoi_dung_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/order/:id/status', async (req, res) => {
  const { trang_thai } = req.body;
  try {
    await pool.query('UPDATE don_hang SET trang_thai = $1 WHERE id = $2', [trang_thai, req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IMAGE
app.post('/api/product/:id/images', async (req, res) => {
  const { url_anh, loai, thu_tu } = req.body;
  try {
    const result = await pool.query('INSERT INTO anh_san_pham (san_pham_id, url_anh, loai, thu_tu) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.id, url_anh, loai, thu_tu]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/product/:id/images', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM anh_san_pham WHERE san_pham_id = $1 ORDER BY thu_tu', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/image/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM anh_san_pham WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH HISTORY
app.post('/api/search-history', async (req, res) => {
  const { nguoi_dung_id, tu_khoa } = req.body;
  try {
    const result = await pool.query('INSERT INTO lich_su_tim_kiem (nguoi_dung_id, tu_khoa, thoi_gian) VALUES ($1, $2, NOW()) RETURNING *', [nguoi_dung_id, tu_khoa]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/:id/search-history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lich_su_tim_kiem WHERE nguoi_dung_id = $1 ORDER BY thoi_gian DESC', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Kết nối database thất bại:', err);
  } else {
    console.log('Kết nối database thành công! Server giờ là:', res.rows[0].now);
  }
});
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
