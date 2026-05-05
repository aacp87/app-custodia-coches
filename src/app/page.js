'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Inicio() {
  const [modo, setModo] = useState('inicio') // 'inicio', 'login-admin', 'admin-panel', 'login-cliente'
  const [pin, setPin] = useState('')
  const [dni, setDni] = useState('')
  const [errorAcceso, setErrorAcceso] = useState('')
  const router = useRouter()

  // Login sencillo para ti
  const entrarComoAdmin = () => {
    if (pin === '1234') { // <-- AQUÍ PUEDES CAMBIAR TU CONTRASEÑA
      setModo('admin-panel')
      setErrorAcceso('')
    } else {
      setErrorAcceso('PIN incorrecto. Inténtalo de nuevo.')
    }
  }

  // Login para que el cliente acceda a su portal
  const entrarComoCliente = async () => {
    setErrorAcceso('')
    const { data } = await supabase.from('clientes').select('*').eq('dni', dni.trim().toUpperCase()).maybeSingle()
    if (data) {
      router.push(`/mi-portal/${data.dni}`) // Le llevamos a su zona privada
    } else {
      setErrorAcceso('No encontramos ningún cliente con ese DNI. Revisa que esté bien escrito.')
    }
  }

  // --- VISTA 1: EL PANEL DE ADMINISTRADOR (Lo que tenías antes) ---
  if (modo === 'admin-panel') {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Panel de Control</h1>
              <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px] mt-1">Autos Victoria - Modo Empleado</p>
            </div>
            <button onClick={() => setModo('inicio')} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">
              Cerrar Sesión ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/clientes" className="bg-white p-8 rounded-3xl shadow-sm border-2 border-blue-100 hover:border-blue-400 hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">👥</div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Directorio Clientes</h2>
              <p className="text-xs text-gray-400 font-bold mt-2">Buscar, ver fichas y gestionar.</p>
            </Link>
            <Link href="/diario" className="bg-white p-8 rounded-3xl shadow-sm border-2 border-orange-100 hover:border-orange-400 hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">📅</div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Diario Entregas</h2>
              <p className="text-xs text-gray-400 font-bold mt-2">Control de llegadas y salidas de hoy.</p>
            </Link>
            <Link href="/nuevo" className="bg-white p-8 rounded-3xl shadow-sm border-2 border-green-100 hover:border-green-400 hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">➕</div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Alta Nuevo Cliente</h2>
              <p className="text-xs text-gray-400 font-bold mt-2">Registrar cliente y vehículo nuevo.</p>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // --- VISTA 2: LA PÁGINA DE INICIO PÚBLICA (Menorca Beach) ---
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center relative font-sans" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516214846430-6d4f6470b107?q=80&w=2070')" }}>
      {/* Capa oscura para que el texto se lea bien sobre la foto */}
      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-4xl p-6">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-xl">Autos Victoria</h1>
          <p className="text-blue-200 font-bold tracking-widest uppercase text-sm mt-4 drop-shadow-md">Custodia de Vehículos en Menorca</p>
        </div>

        {modo === 'inicio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div onClick={() => setModo('login-cliente')} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer text-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔑</div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Soy Cliente</h2>
              <p className="text-xs text-blue-100 font-bold mt-2">Gestiona las fechas de tu vehículo.</p>
            </div>
            
            <div onClick={() => setModo('login-admin')} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer text-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💼</div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Empleados</h2>
              <p className="text-xs text-blue-100 font-bold mt-2">Acceso interno al sistema.</p>
            </div>
          </div>
        )}

        {/* Formulario Cliente */}
        {modo === 'login-cliente' && (
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto transform transition-all">
            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-2">Acceso Clientes</h2>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">Introduce tu DNI/Pasaporte</p>
            <input type="text" placeholder="Ej: 12345678Z" value={dni} onChange={(e) => setDni(e.target.value)} className="w-full p-4 mb-4 border-2 border-gray-100 rounded-xl font-black text-gray-800 uppercase focus:border-blue-500 outline-none" />
            {errorAcceso && <p className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-widest">{errorAcceso}</p>}
            <button onClick={entrarComoCliente} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Entrar a mi portal</button>
            <button onClick={() => {setModo('inicio'); setErrorAcceso('');}} className="w-full text-gray-400 font-bold text-xs mt-4 hover:text-gray-600 uppercase tracking-widest">← Volver</button>
          </div>
        )}

        {/* Formulario Empleado */}
        {modo === 'login-admin' && (
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto transform transition-all">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">Acceso Empleados</h2>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">Introduce el PIN de seguridad</p>
            <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-4 mb-4 border-2 border-gray-100 rounded-xl font-black text-gray-800 text-center tracking-[1em] focus:border-black outline-none" />
            {errorAcceso && <p className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-widest">{errorAcceso}</p>}
            <button onClick={entrarComoAdmin} className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all">Acceder al Sistema</button>
            <button onClick={() => {setModo('inicio'); setErrorAcceso('');}} className="w-full text-gray-400 font-bold text-xs mt-4 hover:text-gray-600 uppercase tracking-widest">← Volver</button>
          </div>
        )}

      </div>
    </div>
  )
}