// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Replicate = require("replicate");
const { writeFile } = require('fs/promises');
const fs = require("fs/promises");


dotenv.config();




const app = express();
app.use(cors());
app.use(express.json());
cloudinary.config({
  cloud_name: 'dnnudi0kr',
  api_key: '618554135849492',
  api_secret: 'DU5erxbBwiE6vfqtPC-SDy2z0FA',
});

// Cấu hình storage cho multer để upload lên Cloudinary trong folder 'products'
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({ storage });

// API upload ảnh
app.post('/api/images/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: req.file.path, // link ảnh trên Cloudinary
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});
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

app.get("/api/products", async (req, res) => {
  try {
    const query = `
      SELECT 
        sp.id,
        sp.ten,
        sp.mo_ta,
        sp.gia,
        sp.danh_muc,
        sp.duong_dan_anh,
        sp.tao_luc,
        sp.danh_gia_trung_binh,
        ch.ten_cua_hang,
        ch.id AS cua_hang_id
      FROM san_pham sp
      JOIN cua_hang ch ON ch.id = sp.cua_hang_id
      ORDER BY sp.tao_luc DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách sản phẩm" });
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
// Lấy tất cả đơn hàng
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await pool.query("SELECT * FROM don_hang");
    res.json(orders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server" });
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

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.get('/api/store/:id/customers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT nd.id, nd.ten_dang_nhap, nd.email
      FROM nguoi_dung nd
      JOIN don_hang dh ON dh.nguoi_dung_id = nd.id
      JOIN chi_tiet_don_hang ct ON ct.don_hang_id = dh.id
      JOIN san_pham sp ON sp.id = ct.san_pham_id
      WHERE sp.cua_hang_id = $1
    `, [req.params.id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/store/:storeId/customer/:customerId/orders', async (req, res) => {
  try {
    const { storeId, customerId } = req.params;
    const result = await pool.query(`
      SELECT dh.*, ct.*, sp.ten AS ten_san_pham
      FROM don_hang dh
      JOIN chi_tiet_don_hang ct ON ct.don_hang_id = dh.id
      JOIN san_pham sp ON sp.id = ct.san_pham_id
      WHERE dh.nguoi_dung_id = $1 AND sp.cua_hang_id = $2
      ORDER BY dh.ngay_dat DESC
    `, [customerId, storeId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/store/:id/customer-count', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(DISTINCT nd.id) AS so_luong_khach
      FROM nguoi_dung nd
      JOIN don_hang dh ON dh.nguoi_dung_id = nd.id
      JOIN chi_tiet_don_hang ct ON ct.don_hang_id = dh.id
      JOIN san_pham sp ON sp.id = ct.san_pham_id
      WHERE sp.cua_hang_id = $1
    `, [req.params.id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/customers/orders-summary", async (req, res) => {
  try {
    const query = `
      SELECT 
        nd.id,
        nd.ten_dang_nhap AS ten,
        nd.email,
        COUNT(dh.id) AS tong_don,
        COUNT(CASE WHEN dh.trang_thai = 'cho_duyet' THEN 1 END) AS cho_duyet,
        COUNT(CASE WHEN dh.trang_thai = 'dang_xu_ly' THEN 1 END) AS dang_giao,
        COUNT(CASE WHEN dh.trang_thai = 'hoan_thanh' THEN 1 END) AS hoan_thanh,
        COUNT(CASE WHEN dh.trang_thai = 'da_huy' THEN 1 END) AS da_huy
      FROM nguoi_dung nd
      LEFT JOIN don_hang dh ON dh.nguoi_dung_id = nd.id
      WHERE nd.vai_tro = 'khach_hang'
      GROUP BY nd.id, nd.ten_dang_nhap, nd.email
      ORDER BY nd.ten_dang_nhap ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách khách hàng" });
  }
});
app.get("/api/customers/:id/order-history", async (req, res) => {
  const customerId = req.params.id;

  try {
    const query = `
      SELECT 
        dh.id AS don_hang_id,
        dh.ngay_dat,
        dh.tong_tien,
        dh.trang_thai,
        json_agg(json_build_object(
          'san_pham_id', sp.id,
          'ten_san_pham', sp.ten,
          'kich_co', ctdh.kich_co,
          'so_luong', ctdh.so_luong,
          'gia', ctdh.gia,
          'anh', sp.duong_dan_anh
        )) AS san_pham
      FROM don_hang dh
      JOIN chi_tiet_don_hang ctdh ON ctdh.don_hang_id = dh.id
      JOIN san_pham sp ON sp.id = ctdh.san_pham_id
      WHERE dh.nguoi_dung_id = $1
      GROUP BY dh.id
      ORDER BY dh.ngay_dat DESC
    `;
    const result = await pool.query(query, [customerId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi lấy lịch sử đơn hàng" });
  }
});
app.get("/api/orders/:orderId/details", async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const query = `
      SELECT 
        dh.id AS don_hang_id,
        dh.ngay_dat,
        dh.tong_tien,
        dh.trang_thai,
        nd.id AS nguoi_dung_id,
        nd.ten_dang_nhap,
        nd.email,
        json_agg(json_build_object(
          'san_pham_id', sp.id,
          'ten_san_pham', sp.ten,
          'gia', ctdh.gia,
          'kich_co', ctdh.kich_co,
          'so_luong', ctdh.so_luong,
          'duong_dan_anh', sp.duong_dan_anh
        )) AS chi_tiet_san_pham
      FROM don_hang dh
      JOIN nguoi_dung nd ON nd.id = dh.nguoi_dung_id
      JOIN chi_tiet_don_hang ctdh ON ctdh.don_hang_id = dh.id
      JOIN san_pham sp ON sp.id = ctdh.san_pham_id
      WHERE dh.id = $1
      GROUP BY dh.id, nd.id, nd.ten_dang_nhap, nd.email
    `;

    const result = await pool.query(query, [orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi lấy chi tiết đơn hàng" });
  }
});
app.get("/api/orders/revenue", async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) AS so_don_hoan_thanh,
        SUM(tong_tien) AS tong_doanh_thu
      FROM don_hang
      WHERE trang_thai = 'hoan_thanh'
    `;

    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi khi tính doanh thu:", err);
    res.status(500).json({ error: "Lỗi server khi tính doanh thu" });
  }
});
app.get("/api/statistics/weekly-summary", async (req, res) => {
  try {
    const query = `
      WITH don_hoan_thanh_trong_tuan AS (
        SELECT * FROM don_hang
        WHERE trang_thai = 'hoan_thanh'
          AND ngay_dat >= date_trunc('week', CURRENT_DATE)
          AND ngay_dat < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
      )
      SELECT
        COUNT(dh.id) AS so_don_hoan_thanh,
        COALESCE(SUM(ctdh.so_luong), 0) AS so_san_pham_ban_ra,
        COALESCE(SUM(dh.tong_tien), 0) AS tong_doanh_thu
      FROM don_hoan_thanh_trong_tuan dh
      LEFT JOIN chi_tiet_don_hang ctdh ON ctdh.don_hang_id = dh.id
    `;

    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi khi thống kê tuần:", err);
    res.status(500).json({ error: "Lỗi server khi thống kê tuần" });
  }
});
app.get("/api/don-hang/theo-ngay", async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Thiếu ngày bắt đầu hoặc kết thúc" });
  }

  try {
    const query = `
      SELECT 
        dh.*, 
        nd.ten_dang_nhap AS ten_khach_hang,
        nd.email
      FROM don_hang dh
      JOIN nguoi_dung nd ON dh.nguoi_dung_id = nd.id
      WHERE dh.ngay_dat BETWEEN $1 AND $2
      ORDER BY dh.ngay_dat DESC
    `;
    const values = [startDate, endDate];
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi truy vấn đơn hàng theo ngày:", err);
    res.status(500).json({ error: "Lỗi server khi lấy đơn hàng theo ngày" });
  }
});


//đánh giá
app.post("/api/danh-gia/san-pham", async (req, res) => {
  const { nguoi_dung_id, san_pham_id, so_sao, noi_dung } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!nguoi_dung_id || !san_pham_id || !so_sao) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  try {
    const query = `
      INSERT INTO danh_gia (nguoi_dung_id, san_pham_id, so_sao, noi_dung)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [nguoi_dung_id, san_pham_id, so_sao, noi_dung || null];
    const result = await pool.query(query, values);

    return res.status(201).json({
      message: "Đánh giá sản phẩm thành công",
      danh_gia: result.rows[0],
    });
  } catch (err) {
    console.error("Lỗi đánh giá sản phẩm:", err);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
});
app.get("/api/san-pham/:id/danh-gia", async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT d.*, nd.ten_dang_nhap 
      FROM danh_gia d
      LEFT JOIN nguoi_dung nd ON d.nguoi_dung_id = nd.id
      WHERE d.san_pham_id = $1
      ORDER BY d.tao_luc DESC
    `;
    const result = await pool.query(query, [id]);
    
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Lỗi lấy đánh giá:", err);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
});



// POST /api/danh-gia
app.post('/api/danh-gia', async (req, res) => {
  const { nguoi_dung_id, san_pham_id, so_sao, noi_dung } = req.body;

  if (!nguoi_dung_id || !san_pham_id || !so_sao) {
    return res.status(400).json({ error: 'Thiếu thông tin đánh giá' });
  }

  try {
    // 1. Thêm đánh giá vào bảng danh_gia
    await pool.query(
      `INSERT INTO danh_gia (nguoi_dung_id, san_pham_id, so_sao, noi_dung)
       VALUES ($1, $2, $3, $4)`,
      [nguoi_dung_id, san_pham_id, so_sao, noi_dung || null]
    );

    // 2. Tính lại điểm trung bình đánh giá
    const result = await pool.query(
      `SELECT ROUND(AVG(so_sao)::NUMERIC, 2) AS diem_trung_binh
       FROM danh_gia
       WHERE san_pham_id = $1`,
      [san_pham_id]
    );

    const diemTrungBinh = result.rows[0].diem_trung_binh || 0;

    // 3. Cập nhật bảng san_pham với điểm trung bình mới
    await pool.query(
      `UPDATE san_pham
       SET danh_gia_trung_binh = $1
       WHERE id = $2`,
      [diemTrungBinh, san_pham_id]
    );

    res.json({ message: 'Đánh giá thành công', diem_trung_binh: diemTrungBinh });
  } catch (error) {
    console.error('Lỗi khi đánh giá sản phẩm:', error);
    res.status(500).json({ error: 'Lỗi server khi đánh giá sản phẩm' });
  }
});


// GET /api/danh-gia
app.get('/api/xem-danh-gia', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dg.id, dg.so_sao, dg.noi_dung, dg.tao_luc,
             nd.id AS nguoi_dung_id, nd.ten_dang_nhap AS ten_nguoi_dung,
             sp.id AS san_pham_id, sp.ten AS ten_san_pham,
             sp.duong_dan_anh AS anh_san_pham
      FROM danh_gia dg
      JOIN nguoi_dung nd ON dg.nguoi_dung_id = nd.id
      JOIN san_pham sp ON dg.san_pham_id = sp.id
      ORDER BY dg.tao_luc DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy đánh giá' });
  }
});
// GET /api/danh-gia/tong-quan
app.get('/api/danh-gia/tong-quan', async (req, res) => {
  try {
    const latestReviewsQuery = `
      SELECT dg.id, dg.so_sao, dg.noi_dung, dg.tao_luc,
             nd.ten_dang_nhap AS ten_nguoi_dung,
             sp.ten AS ten_san_pham,
             sp.duong_dan_anh AS anh_san_pham
      FROM danh_gia dg
      JOIN nguoi_dung nd ON dg.nguoi_dung_id = nd.id
      JOIN san_pham sp ON dg.san_pham_id = sp.id
      ORDER BY dg.tao_luc DESC
      LIMIT 4
    `;

    const avgStarsQuery = `
      SELECT ROUND(AVG(so_sao)::numeric, 2) AS danh_gia_trung_binh
      FROM danh_gia
    `;

    const [latestResult, avgResult] = await Promise.all([
      pool.query(latestReviewsQuery),
      pool.query(avgStarsQuery)
    ]);

    res.json({
      danh_gia_moi_nhat: latestResult.rows,
      danh_gia_trung_binh: avgResult.rows[0].danh_gia_trung_binh
    });
  } catch (error) {
    console.error('Lỗi khi lấy tổng quan đánh giá:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy tổng quan đánh giá' });
  }
});


// //api thử đồ
// app.get("/api/anh", async (req, res) => {
//   try {
//     const input = {
//       garm_img:
//         "https://replicate.delivery/pbxt/KgwTlZyFx5aUU3gc5gMiKuD5nNPTgliMlLUWx160G4z99YjO/sweater.webp",
//       human_img:
//         "https://replicate.delivery/pbxt/KgwTlhCMvDagRrcVzZJbuozNJ8esPqiNAIJS3eMgHrYuHmW4/KakaoTalk_Photo_2024-04-04-21-44-45.png",
//       garment_des: "cute pink top",
//     };

//     const output = await replicate.run(
//       "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
//       { input }
//     );

//     // output là URL -> fetch ảnh
//     const imageResponse = await fetch(output); // Nếu lỗi, import 'node-fetch'
//     const buffer = await imageResponse.arrayBuffer();
//     await writeFile("output.jpg", Buffer.from(buffer));

//     res.send("Image saved as output.jpg");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Có lỗi xảy ra");
//   }
// });
app.post("/api/anh", upload.single("human_img"), async (req, res) => {
  try {
    const { garment_des, garm_img } = req.body;
    const human_img_path = req.file.path;

    // Chuyển ảnh human thành base64
    const fileBuffer = await fs.readFile(human_img_path);
    const ext = path.extname(req.file.originalname).slice(1); // ví dụ: 'png'
    const base64Human = `data:image/${ext};base64,${fileBuffer.toString("base64")}`;

    // Tạo input cho replicate
    const input = {
      garm_img: garm_img,             // là URL → dùng trực tiếp
      human_img: base64Human,        // là base64 của ảnh upload
      garment_des: garment_des || "default description",
    };

    const output = await replicate.run(
      "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
      { input }
    );

    // Lấy ảnh từ kết quả output (URL)
    const imageResponse = await fetch(output);
    const buffer = await imageResponse.arrayBuffer();
    await fs.writeFile("output.jpg", Buffer.from(buffer));

    // Xoá file upload tạm
    await fs.unlink(human_img_path);

    res.send("Image saved as output.jpg");
  } catch (err) {
    console.error("Lỗi:", err);
    res.status(500).send("Có lỗi xảy ra");
  }
});


app.post('/api/thu-do', upload.single('humanImg'), async (req, res) => {
  try {
    // 1️⃣ Kiểm tra ảnh người
    if (!req.file || !req.file.path) {
      console.log('❌ Không có ảnh người được upload');
      return res.status(400).json({ error: 'Ảnh người (humanImg) không hợp lệ' });
    }
    const humanImgUrl = req.file.path;
    console.log('✅ humanImg URL:', humanImgUrl);

    // 2️⃣ Kiểm tra link ảnh sản phẩm
    const garmImgUrl = req.body.garmImg;
    if (!garmImgUrl || !garmImgUrl.startsWith('http')) {
      console.log('❌ Link ảnh quần áo không hợp lệ:', garmImgUrl);
      return res.status(400).json({ error: 'Link ảnh quần áo (garmImg) không hợp lệ' });
    }
    console.log('✅ garmImg URL:', garmImgUrl);

    // 3️⃣ Garment description (nếu có)
    const garmDesc = req.body.garmentDes || 'a garment';
    console.log('✅ garmentDes:', garmDesc);

    // 4️⃣ Gọi Replicate API
    console.log('📤 Gửi request đến Replicate...');
    const output = await replicate.run(
      "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
      {
        input: {
          human_img: humanImgUrl,
          garm_img: garmImgUrl,
          garment_des: garmDesc,
        },
      }
    );

    console.log('✅ Replicate trả về:', output);

    // 5️⃣ Kiểm tra kết quả
    if (!output || typeof output !== 'string') {
      console.log('❌ Kết quả từ Replicate không phải là link ảnh:', output);
      return res.status(500).json({
        success: false,
        message: 'Replicate không trả về ảnh đúng định dạng',
        output,
      });
    }

    // ✅ Trả về ảnh thử đồ
    return res.json({
      success: true,
      outputImage: output,
    });

  } catch (error) {
    console.error('❌ Lỗi khi thử đồ:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi thử đồ',
      error: error.message,
    });
  }
});

