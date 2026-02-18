import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { formatRupiah } from '../utils/formatRupiah'
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore()

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Keranjang Belanja</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="ml-3 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Keranjang kosong</h3>
                    <p className="mt-1 text-sm text-gray-500">Tambahkan menu ke keranjang</p>
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {items.map((item) => (
                          <li key={item.menu_id} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            </div>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.name}</h3>
                                  <p className="ml-4">{formatRupiah(item.price * item.quantity)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{formatRupiah(item.price)} per item</p>
                              </div>
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <div className="flex items-center border-gray-300 rounded-md">
                                  <button
                                    onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}
                                    className="p-1 rounded-l-md border border-gray-300 hover:bg-gray-50"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="px-3 py-1 border-t border-b border-gray-300">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}
                                    className="p-1 rounded-r-md border border-gray-300 hover:bg-gray-50"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeItem(item.menu_id)}
                                  className="text-red-600 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>{formatRupiah(getTotal())}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  {getItemCount()} items
                </p>
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="mt-6 w-full btn btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Checkout</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}