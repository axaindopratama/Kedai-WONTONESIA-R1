import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import { Database } from '../../supabase/types'
import { useCartStore } from '../../store/cartStore'
import { toast } from 'react-hot-toast'
import { MenuCard } from '../../components/MenuCard'
import { Filter, ShoppingCart } from 'lucide-react'
import { CartButton } from '../../components/CartButton'

type MenuItem = Database['public']['Tables']['menus']['Row']

const categories = ['Semua', 'Makanan', 'Minuman', 'Snack']

export const MenuPage: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [filteredMenus, setFilteredMenus] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [loading, setLoading] = useState(true)
  const { addItem, getItemCount } = useCartStore()

  useEffect(() => {
    fetchMenus()
  }, [])

  useEffect(() => {
    filterMenus()
  }, [menus, selectedCategory])

  const fetchMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMenus(data || [])
    } catch (error) {
      console.error('Error fetching menus:', error)
      toast.error('Gagal memuat menu')
    } finally {
      setLoading(false)
    }
  }

  const filterMenus = () => {
    if (selectedCategory === 'Semua') {
      setFilteredMenus(menus)
    } else {
      setFilteredMenus(menus.filter(menu => menu.category === selectedCategory))
    }
  }

  const handleAddToCart = (menu: MenuItem) => {
    addItem({
      menu_id: menu.id,
      name: menu.name,
      price: menu.price,
      quantity: 1,
    })
    toast.success(`${menu.name} ditambahkan ke keranjang`)
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Kami</h1>
            <p className="mt-1 text-sm text-gray-500">Pilih menu favorit Anda</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center">
            <CartButton />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {filteredMenus.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Menu tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}