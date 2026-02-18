import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import MenuPage from './pages/user/MenuPage'
import CheckoutPage from './pages/CheckoutPage'
import MyOrdersPage from './pages/user/MyOrdersPage'
import AdminDashboard from './pages/admin/Dashboard'
import AdminPOS from './pages/admin/POS'
import AdminMenu from './pages/admin/Menu'
import AdminInventory from './pages/admin/Inventory'
import AdminFinance from './pages/admin/Finance'
import { CartButton } from './components/CartButton'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          
          {/* Cart Button */}
          <div className="fixed bottom-4 right-4 z-40">
            <CartButton />
          </div>
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected User Routes */}
            <Route
              path="/menu"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MenuPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CheckoutPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyOrdersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout admin={true}>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pos"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout admin={true}>
                    <AdminPOS />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout admin={true}>
                    <AdminMenu />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout admin={true}>
                    <AdminInventory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/finance"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout admin={true}>
                    <AdminFinance />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App