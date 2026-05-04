'use client'
import { useState } from 'react'
import { supabase } from '../../supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      alert("Error al entrar: " + error.message)
    } else {
      router.push('/') // Te manda a la página principal tras entrar
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '30px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#0052cc' }}>ACCESO EMPLEADOS</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          <button type="submit" style={{ padding: '12px', backgroundColor: '#0052cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  )
}