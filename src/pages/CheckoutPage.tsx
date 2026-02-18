import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { Database } from '../supabase/types'
import { useCartStore } from '../store/cartStore'
import { formatRupiah, generateWhatsAppMessage } from '../utils/formatRupiah'
import { toast } from 'react-hot-toast'
import { 
  MapPin, 
  Clock, 
  Home, 
  CreditCard, 
  Truck,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'

type Order = Database['public']['Tables']['orders']['Row']

interface CheckoutForm {
  type: 'dine-in' | 'delivery' | 'pickup'
  table_no: string
  address: string
  pickup_time: string
  notes: string
}

const checkoutConfig = {
  'dine-in': {
    icon: <Home className="h-6 w-6" />,
    title: 'Makan di Tempat',
    description: 'Nikmati makanan langsung di kedai kami',
    required: ['table_no'],
  },
  delivery: {
    icon: <Truck className="h-6 w-6" />,
    title: 'Pengiriman',
    description: 'Pesanan akan dikirim ke alamat Anda',
    required: ['address'],
  },
  pickup: {
    icon: <Clock className="h-6 w-6" />,
    title: 'Ambil Sendiri',
    description: 'Ambil pesanan di kedai pada waktu yang ditentukan',
    required: ['pickup_time'],
  },
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    type: 'dine-in',
    table_no: '',
    address: '',
    pickup_time: '',
    notes: '',
  })

  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu')
    }
  }, [items, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCheckoutForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const config = checkoutConfig[checkoutForm.type]
    for (const field of config.required) {
      if (!checkoutForm[field as keyof CheckoutForm]) {
        toast.error(`Mohon isi ${field.replace('_', ' ')}`)
        return false
      }
    }
    return true
  }

  const handleCheckout = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const orderItems = items.map(item => ({
        menu_id: item.menu_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: orderItems,
          total: getTotal(),
          status: 'pending',
          type: checkoutForm.type,
          table_no: checkoutForm.type === 'dine-in' ? checkoutForm.table_no : null,
          address: checkoutForm.type === 'delivery' ? checkoutForm.address : null,
          pickup_time: checkoutForm.type === 'pickup' ? checkoutForm.pickup_time : null,
        })
        .select()
        .single()

      if (error) throw error

      // Generate WhatsApp message
      const message = generateWhatsAppMessage(
        user.email || 'Pelanggan',
        orderItems,
        getTotal(),
        checkoutForm.type,
        checkoutForm.address,
        checkoutForm.table_no,
        checkoutForm.pickup_time
      )

      const whatsappUrl = `https://wa.me/6281250070876?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')

      toast.success('Pesanan berhasil dibuat! Silakan konfirmasi via WhatsApp.')
      clearCart()
      navigate('/my-orders')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center text-primary-600 hover:text-primary-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Menu
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">Pilih metode pengiriman dan lengkapi data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metode Pengiriman</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(checkoutConfig).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setCheckoutForm(prev => ({ ...prev, type: type as any }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      checkoutForm.type === type
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        checkoutForm.type === type ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        {config.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">{config.title}</h3>
                        <p className="text-sm text-gray-500">{config.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {checkoutForm.type === 'dine-in' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Meja
                    </label>
                    <input
                      type="text"
                      name="table_no"
                      value={checkoutForm.table_no}
                      onChange={handleInputChange}
                      placeholder="Masukkan nomor meja"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {checkoutForm.type === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      name="address"
                      value={checkoutForm.address}
                      onChange={handleInputChange}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {checkoutForm.type === 'pickup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Pickup
                    </label>
                    <input
                      type="datetime-local"
                      name="pickup_time"
                      value={checkoutForm.pickup_time}
                      onChange={handleInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    value={checkoutForm.notes}
                    onChange={handleInputChange}
                    placeholder="Catatan khusus untuk pesanan"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.menu_id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity} × {item.name}
                    </span>
                    <span className="font-medium">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatRupiah(getTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkir</span>
                  <span>{formatRupiah(0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">{formatRupiah(getTotal())}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full btn btn-primary mt-6 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pesan Sekarang
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Setelah checkout, pesanan akan dikirim ke WhatsApp untuk konfirmasi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}