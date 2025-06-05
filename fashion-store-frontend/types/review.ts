export interface Product {
  id: number
  cua_hang_id: number
  ten: string
  mo_ta: string
  gia: number
  danh_muc: string
  duong_dan_anh: string
  tao_luc: string
  
  danh_gia_trung_binh?: number // Thêm đánh giá trung bình
}
