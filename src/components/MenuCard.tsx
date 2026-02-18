import React from 'react'
import { Database } from '../supabase/types'
import { Plus, Minus } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { toast } from 'react-hot-toast'

type MenuItem = Database['public']['Tables']['menus']['Row']

interface MenuCardProps {
  menu: MenuItem
  onAddToCart: (menu: MenuItem) => void
}

export const MenuCard: React.FC<MenuCardProps> = ({ menu, onAddToCart }) => {
  const { removeItem, updateQuantity, items } = useCartStore()
  const cartItem = items.find(item => item.menu_id === menu.id)

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(menu.id, cartItem.quantity + 1)
    } else {
      onAddToCart(menu)
    }
  }

  const handleDecrement = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(menu.id, cartItem.quantity - 1)
      } else {
        removeItem(menu.id)
        toast.success(`${menu.name} dihapus dari keranjang`)
      }
    }
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
        {menu.image ? (
          <img
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900">{menu.name}</h3>
          <span className="text-lg font-bold text-primary-600">
            {formatRupiah(menu.price)}
          </span>
        </div>
        
        {menu.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{menu.description}</p>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            {menu.category}
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDecrement}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              disabled={!cartItem}
            >
              <Minus className="h-4 w-4" />
            </button>
            
            <span className="w-8 text-center text-sm font-medium">
              {cartItem?.quantity || 0}
            </span>
            
            <button
              onClick={handleIncrement}
              className="p-1 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}