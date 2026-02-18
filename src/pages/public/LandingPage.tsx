import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Utensils, Phone, MapPin, Clock } from 'lucide-react'

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth()

  if (user) {
    if (user.role === 'admin') {
      return <Link to="/admin" className="block w-full h-full" />
    } else {
      return <Link to="/menu" className="block w-full h-full" />
    }
  }

  const features = [
    {
      icon: <Utensils className="h-8 w-8 text-primary-600" />,
      title: 'Menu Lengkap',
      description: 'Pilihan makanan dan minuman berkualitas dengan harga terjangkau',
    },
    {
      icon: <Phone className="h-8 w-8 text-primary-600" />,
      title: 'Pesan Mudah',
      description: 'Pesan melalui aplikasi atau langsung via WhatsApp',
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary-600" />,
      title: 'Berpengalaman',
      description: 'Dine-in, delivery, atau pickup sesuai kebutuhan Anda',
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: 'Real-time Tracking',
      description: 'Lacak status pesanan Anda secara real-time',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gradient-to-b from-white to-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Selamat Datang di</span>
                  <span className="block text-primary-600">Kedai WONTONESIA</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Nikmati berbagai macam menu wonton dan makanan Asia yang lezat dengan kualitas terbaik.
                  Pesan sekarang dan rasakan pengalaman berbeda!
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button
                      onClick={login}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      Masuk dengan Google
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/menu"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                    >
                      Lihat Menu
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Kenapa Memilih Kami</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Pengalaman Terbaik untuk Anda
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Kami berkomitmen memberikan pelayanan terbaik dengan kualitas makanan terjamin
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      {feature.icon}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Siap untuk memesan?</span>
            <span className="block text-primary-200">Masuk sekarang dan mulai pesan!</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={login}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
              >
                Mulai Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}