import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OrderItem } from '../supabase/types'

interface CartItem extends OrderItem {
  name: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (menuId: string) => void
  updateQuantity: (menuId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.menu_id === item.menu_id)
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.menu_id === item.menu_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...items, item] })
        }
      },
      
      removeItem: (menuId) => {
        set({ items: get().items.filter((item) => item.menu_id !== menuId) })
      },
      
      updateQuantity: (menuId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuId)
          return
        }
        
        set({
          items: get().items.map((item) =>
            item.menu_id === menuId ? { ...item, quantity } : item
          ),
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)