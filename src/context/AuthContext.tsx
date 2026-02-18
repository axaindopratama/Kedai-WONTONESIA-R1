import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { Database } from '../supabase/types'

interface AuthContextType {
  user: Database['public']['Tables']['users']['Row'] | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting user:', error)
        setLoading(false)
        return
      }

      if (authUser) {
        // Try to fetch user data with retry logic (in case trigger hasn't created the record yet)
        let userData = null
        let attempts = 0
        const maxAttempts = 5
        
        while (attempts < maxAttempts && !userData) {
          const { data, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('uid', authUser.id)
            .single()
          
          if (userError) {
            console.warn(`Attempt ${attempts + 1} to fetch user data failed, retrying...`, userError)
            attempts++
            await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms before retry
          } else {
            userData = data
          }
        }
        
        if (userData) {
          setUser(userData)
        } else {
          console.error('Failed to fetch user data after retries')
          // Force logout if we can't fetch user data
          await supabase.auth.signOut()
        }
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Same retry logic for auth state change
        let userData = null
        let attempts = 0
        const maxAttempts = 5
        
        while (attempts < maxAttempts && !userData) {
          const { data, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('uid', session.user.id)
            .single()
          
          if (userError) {
            console.warn(`Attempt ${attempts + 1} to fetch user data failed, retrying...`, userError)
            attempts++
            await new Promise(resolve => setTimeout(resolve, 500))
          } else {
            userData = data
          }
        }
        
        if (userData) {
          setUser(userData)
        } else {
          console.error('Failed to fetch user data after retries')
          await supabase.auth.signOut()
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}