export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          uid: string
          name: string
          email: string
          avatar_url: string | null
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          uid: string
          name: string
          email: string
          avatar_url?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          uid?: string
          name?: string
          email?: string
          avatar_url?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
      }
      menus: {
        Row: {
          id: string
          name: string
          price: number
          category: string
          image: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          category: string
          image?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          category?: string
          image?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          items: OrderItem[]
          total: number
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed'
          type: 'dine-in' | 'delivery' | 'pickup'
          table_no: string | null
          address: string | null
          pickup_time: string | null
          shipping_fee: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          items: OrderItem[]
          total: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed'
          type: 'dine-in' | 'delivery' | 'pickup'
          table_no?: string | null
          address?: string | null
          pickup_time?: string | null
          shipping_fee?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          items?: OrderItem[]
          total?: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed'
          type?: 'dine-in' | 'delivery' | 'pickup'
          table_no?: string | null
          address?: string | null
          pickup_time?: string | null
          shipping_fee?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          date: string
          amount: number
          description: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          amount: number
          description: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          amount?: number
          description?: string
          category?: string
          created_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          item_name: string
          current_stock: number
          unit: string
          last_update: string
        }
        Insert: {
          id?: string
          item_name: string
          current_stock: number
          unit: string
          last_update?: string
        }
        Update: {
          id?: string
          item_name?: string
          current_stock?: number
          unit?: string
          last_update?: string
        }
      }
    }
  }
}

export interface OrderItem {
  menu_id: string
  name: string
  price: number
  quantity: number
}