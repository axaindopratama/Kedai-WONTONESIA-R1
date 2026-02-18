import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user) {
      navigate('/menu')
    }
  }, [user, navigate])

  const handleLogin = async () => {
    try {
      await login()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Kedai WONTONESIA
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Gunakan akun Google Anda untuk melanjutkan
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow -space-y-px">
            <button
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-primary-400 group-hover:text-primary-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </span>
              Masuk dengan Google
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Kembali ke{' '}
              <a href="/" className="font-medium text-primary-600 hover:text-primary-500">
                Beranda
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}