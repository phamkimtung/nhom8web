export interface OrderItem {
  id: number
  don_hang_id: number
  san_pham_id: number
  kich_co: string
  so_luong: number
  gia: number
}

export interface Order {
  id: number
  nguoi_dung_id: number
  ngay_dat: string
  tong_tien: number
  trang_thai: string
  chi_tiet?: OrderItem[]
}
