export interface Product {
  id: number
  cua_hang_id: number
  ten: string
  mo_ta: string
  gia: number
  danh_muc: string
  duong_dan_anh: string
  tao_luc: string
  danh_gia_trung_binh?: number // Thêm trường đánh giá trung bình
  ten_cua_hang?: string // Thêm tên cửa hàng (optional)
}

// Thêm interface cho đánh giá
export interface Review {
  id: number
  nguoi_dung_id: number
  san_pham_id: number
  so_sao: number
  noi_dung?: string
  tao_luc: string
  ten_nguoi_dung?: string
}
