import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import { Database } from '../../supabase/types'
import { formatRupiah } from '../../utils/formatRupiah'
import { toast } from 'react-hot-toast'
import { Plus, Edit, Trash2 } from 'lucide-react'

type MenuItem = Database['public']['Tables']['menus']['Row']

interface MenuFormData {
  name: string
  price: number
  category: string
  description: string
  image: File | null
}

export const AdminMenu: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState<MenuFormData>({
    name: '',
    price: 0,
    category: 'Makanan',
    description: '',
    image: null,
  })

  const categories = ['Makanan', 'Minuman', 'Snack']

  useEffect(() => {
    fetchMenus()
  }, [])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0],
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let imageUrl = editingMenu?.image || null

      // Upload image if exists
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `menus/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(filePath, formData.image)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('menu-images')
          .getPublicUrl(filePath)

        imageUrl = data.publicUrl
      }

      if (editingMenu) {
        // Update menu
        const { error } = await supabase
          .from('menus')
          .update({
            name: formData.name,
            price: formData.price,
            category: formData.category,
            description: formData.description,
            image: imageUrl,
          })
          .eq('id', editingMenu.id)

        if (error) throw error
        toast.success('Menu berhasil diperbarui')
      } else {
        // Create new menu
        const { error } = await supabase
          .from('menus')
          .insert({
            name: formData.name,
            price: formData.price,
            category: formData.category,
            description: formData.description,
            image: imageUrl,
          })

        if (error) throw error
        toast.success('Menu berhasil ditambahkan')
      }

      resetForm()
      fetchMenus()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving menu:', error)
      toast.error('Gagal menyimpan menu')
    }
  }

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu)
    setFormData({
      name: menu.name,
      price: menu.price,
      category: menu.category,
      description: menu.description || '',
      image: null,
    })
    setShowModal(true)
  }

  const handleDelete = async (menuId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini?')) return

    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', menuId)

      if (error) throw error
      toast.success('Menu berhasil dihapus')
      fetchMenus()
    } catch (error) {
      console.error('Error deleting menu:', error)
      toast.error('Gagal menghapus menu')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      category: 'Makanan',
      description: '',
      image: null,
    })
    setEditingMenu(null)
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Menu</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola menu makanan dan minuman</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Menu
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menus.map((menu) => (
              <div key={menu.id} className="card hover:shadow-md transition-shadow">
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
                  
                  <p className="text-sm text-gray-500">{menu.category}</p>
                  
                  {menu.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{menu.description}</p>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="flex-1 btn btn-secondary flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="flex-1 btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Menu
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gambar
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {formData.image && (
                      <p className="mt-1 text-sm text-gray-500">
                        {formData.image.name}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 btn btn-primary"
                    >
                      {editingMenu ? 'Update' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      className="flex-1 btn btn-secondary"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}