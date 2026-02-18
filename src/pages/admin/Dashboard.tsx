import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import { Database } from '../../supabase/types'
import { formatRupiah } from '../../utils/formatRupiah'
import { toast } from 'react-hot-toast'
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Utensils
} from 'lucide-react'

type Order = Database['public']['Tables']['orders']['Row']

const statsConfig = [
  {
    title: 'Total Pesanan',
    value: 0,
    icon: <ShoppingCart className="h-8 w-8 text-primary-600" />,
    change: '+12%',
    changeType: 'positive' as const,
  },
  {
    title: 'Total Pendapatan',
    value: 0,
    icon: <DollarSign className="h-8 w-8 text-green-600" />,
    change: '+20%',
    changeType: 'positive' as const,
  },
  {
    title: 'Pesanan Pending',
    value: 0,
    icon: <Clock className="h-8 w-8 text-yellow-600" />,
    change: '-5%',
    changeType: 'negative' as const,
  },
  {
    title: 'Stok Terkini',
    value: 0,
    icon: <Package className="h-8 w-8 text-blue-600" />,
    change: '+0%',
    changeType: 'neutral' as const,
  },
]

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

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(statsConfig)

  useEffect(() => {
    fetchOrders()
    fetchStats()
    
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
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch today's orders
      const today = new Date().toISOString().split('T')[0]
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

      // Calculate stats
      const totalOrders = todayOrders?.length || 0
      const totalRevenue = todayOrders?.reduce((sum, order) => sum + order.total, 0) || 0
      const pendingOrders = todayOrders?.filter(order => order.status === 'pending').length || 0

      setStats(prev => prev.map(stat => {
        switch (stat.title) {
          case 'Total Pesanan':
            return { ...stat, value: totalOrders }
          case 'Total Pendapatan':
            return { ...stat, value: totalRevenue }
          case 'Pesanan Pending':
            return { ...stat, value: pendingOrders }
          default:
            return stat
        }
      }))
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error
      toast.success('Status pesanan berhasil diperbarui')
      fetchOrders()
      fetchStats()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Gagal memperbarui status pesanan')
    }
  }

  const getStatusBadge = (status: Order['status']) => {
    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </span>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola kedai Anda</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.title === 'Total Pendapatan' 
                          ? formatRupiah(stat.value)
                          : stat.value
                        }
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pesanan Terbaru</h2>
            <a
              href="/admin/pos"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Lihat semua →
            </a>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pesanan</h3>
              <p className="mt-1 text-sm text-gray-500">Pesanan akan muncul di sini</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Pesanan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatRupiah(order.total + (order.shipping_fee || 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Diproses</option>
                          <option value="shipped">Dikirim/Saji</option>
                          <option value="delivered">Selesai</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}