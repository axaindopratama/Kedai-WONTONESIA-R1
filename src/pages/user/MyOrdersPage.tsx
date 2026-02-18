import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import { Database } from '../../supabase/types'
import { formatRupiah } from '../../utils/formatRupiah'
import { toast } from 'react-hot-toast'
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Utensils, 
  Home,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'

type Order = Database['public']['Tables']['orders']['Row']

const statusConfig = {
  pending: {
    icon: <Clock className="h-5 w-5" />,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Pending',
  },
  processing: {
    icon: <Utensils className="h-5 w-5" />,
    color: 'text-blue-600 bg-blue-100',
    label: 'Diproses',
  },
  shipped: {
    icon: <Truck className="h-5 w-5" />,
    color: 'text-purple-600 bg-purple-100',
    label: 'Dikirim/Saji',
  },
  delivered: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-600 bg-green-100',
    label: 'Selesai',
  },
  completed: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-gray-600 bg-gray-100',
    label: 'Selesai',
  },
}

const methodConfig = {
  'dine-in': { icon: <Home className="h-4 w-4" />, label: 'Dine-in' },
  delivery: { icon: <Truck className="h-4 w-4" />, label: 'Delivery' },
  pickup: { icon: <MapPin className="h-4 w-4" />, label: 'Pickup' },
}

export const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    
    // Subscribe to order changes
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppClick = (order: Order) => {
    const phoneNumber = '6281250070876'
    const message = generateWhatsAppMessage(order)
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const generateWhatsAppMessage = (order: Order): string => {
    const items = order.items.map(item => 
      `${item.quantity} ${item.name} (${formatRupiah(item.price)})`
    ).join(', ')
    
    let message = `Halo Admin, saya ${order.user_id}.\n\nOrder: ${items}\n\nTotal: ${formatRupiah(order.total)}\nMetode: ${order.type}`
    
    if (order.type === 'delivery' && order.address) {
      message += `\nAlamat: ${order.address}`
    } else if (order.type === 'dine-in' && order.table_no) {
      message += `\nNomor Meja: ${order.table_no}`
    } else if (order.type === 'pickup' && order.pickup_time) {
      message += `\nWaktu Pickup: ${order.pickup_time}`
    }
    
    return message
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
          <p className="mt-1 text-sm text-gray-500">Lacak status pesanan Anda</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pesanan</h3>
            <p className="mt-1 text-sm text-gray-500">Anda belum pernah melakukan pesanan</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = statusConfig[order.status]
              const method = methodConfig[order.type]
              
              return (
                <div key={order.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${status.color}`}>
                        {status.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Pesanan #{order.id.slice(-6)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {status.label} • {method.icon} {method.label}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Detail Pesanan</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity} × {item.name}
                            </span>
                            <span className="font-medium">
                              {formatRupiah(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Total</span>
                        <span className="text-lg font-bold text-primary-600">
                          {formatRupiah(order.total + (order.shipping_fee || 0))}
                        </span>
                      </div>
                      {order.shipping_fee && (
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>Ongkir</span>
                          <span>{formatRupiah(order.shipping_fee)}</span>
                        </div>
                      )}
                    </div>

                    {order.type === 'dine-in' && order.table_no && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Home className="h-4 w-4 mr-2" />
                        Nomor Meja: {order.table_no}
                      </div>
                    )}
                    
                    {order.type === 'delivery' && order.address && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <span>{order.address}</span>
                      </div>
                    )}
                    
                    {order.type === 'pickup' && order.pickup_time && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Waktu Pickup: {new Date(order.pickup_time).toLocaleString('id-ID')}
                      </div>
                    )}

                    <div className="flex space-x-3 pt-3">
                      <button
                        onClick={() => handleWhatsAppClick(order)}
                        className="flex-1 btn btn-primary flex items-center justify-center"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Hubungi via WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}