import React, { useState } from 'react'
import { useCartStore } from '../store/cartStore'
import { ShoppingCart } from 'lucide-react'
import { CartDrawer } from './CartDrawer'

export const CartButton: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { getItemCount } = useCartStore()

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <ShoppingCart className="h-6 w-6" />
        {getItemCount() > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
            {getItemCount()}
          </span>
        )}
      </button>
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  )
}