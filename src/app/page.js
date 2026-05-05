'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Inicio() {
  const [modo, setModo] = useState('inicio')
  const [pin, setPin] = useState('')
  const [dni, setDni] = useState('')
  const [errorAcceso, setErrorAcceso] = useState('')
  const [idioma, setIdioma] = useState('es') // 'es' o 'en'
  const router = useRouter()

  // --- DICCIONARIO DE TRADUCCIONES ---
  const t = {
    es: {
      titulo: "Autos Victoria",
      subtitulo: "Custodia de Vehículos en Menorca",
      btnCliente: "Soy Cliente",
      descCliente: "Gestiona las fechas de tu vehículo.",
      btnEmp: "Empleados",
      descEmp: "Acceso interno al sistema.",
      loginCliTit: "Acceso Clientes",
      loginCliSub: "Introduce tu DNI/Pasaporte",
      loginCliPlace: "Ej: 12345678Z",
      btnEntrarCli: "Entrar a mi portal",
      btnVolver: "← Volver",
      errDni: "No encontramos ningún cliente con ese documento. Revisa que esté bien escrito.",
      loginEmpTit: "Acceso Empleados",
      loginEmpSub: "Introduce el PIN de seguridad",
      btnEntrarEmp: "Acceder al Sistema",
      errPin: "PIN incorrecto. Inténtalo de nuevo.",
      adminTit: "Panel de Control",
      adminSub: "Autos Victoria - Modo Empleado",
      cerrarSesion: "Cerrar Sesión ✕",
      card1Tit: "Directorio Clientes",
      card1Desc: "Buscar, ver fichas y gestionar.",
      card2Tit: "Diario Entregas",
      card2Desc: "Control de llegadas y salidas.",
      card3Tit: "Alta Nuevo Cliente",
      card3Desc: "Registrar cliente y vehículo."
    },
    en: {
      titulo: "Autos Victoria",
      subtitulo: "Vehicle Custody in Menorca",
      btnCliente: "I am a Client",
      descCliente: "Manage your vehicle's dates.",
      btnEmp: "Employees",
      descEmp: "Internal system access.",
      loginCliTit: "Client Access",
      loginCliSub: "Enter your ID/Passport",
      loginCliPlace: "Ex: 12345678Z",
      btnEntrarCli: "Enter my portal",
      btnVolver: "← Go Back",
      errDni: "We couldn't find any client with that document. Please check it.",
      loginEmpTit: "Employee Access",
      loginEmpSub: "Enter security PIN",
      btnEntrarEmp: "Access System",
      errPin: "Incorrect PIN. Try again.",
      adminTit: "Control Panel",
      adminSub: "Autos Victoria - Employee Mode",
      cerrarSesion: "Log Out ✕",
      card1Tit: "Client Directory",
      card1Desc: "Search, view profiles and manage.",
      card2Tit: "Delivery Diary",
      card2Desc: "Control of arrivals and departures.",
      card3Tit: "New Client",
      card3Desc: "Register new client and vehicle."
    }
  }

  const lang = t[idioma]

  const entrarComoAdmin = () => {
    if (pin === '1234') { 
      setModo('admin-panel')
      setErrorAcceso('')
    } else {
      setErrorAcceso(lang.errPin)
    }
  }

  const entrarComoCliente = async () => {
    setErrorAcceso('')
    const { data } = await supabase.from('clientes').select('*').eq('dni', dni.trim().toUpperCase()).maybeSingle()
    if (data) {
      // Pasamos el idioma por la URL para que el portal sepa en qué idioma abrirse
      router.push(`/mi-portal/${data.dni}?lang=${idioma}`) 
    } else {
      setErrorAcceso(lang.errDni)
    }
  }

  // --- VISTA 1: EL PANEL DE ADMINISTRADOR ---
  if (modo === 'admin-panel') {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">{lang.adminTit}</h1>
              <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px] mt-1">{lang.adminSub}</p>
            </div>
            <button onClick={() => setModo('inicio')} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">
              {lang.cerrarSesion}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/clientes" className="bg-white p-8 rounded-3xl shadow-sm border-2 border-blue-100 hover:border-blue-400 hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">👥</div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{lang.card1Tit}</h2>
              <p className="text-xs text-gray-400 font-bold mt-2">{lang.card1Desc}</p>
            </Link>
            <Link href="/diario" className="bg-white p-8 rounded-3xl shadow-sm border-2 border-orange-100 hover:border-orange-400 hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">📅</div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{lang.card2Tit}</h2>
              <p className="text-xs text-gray-400 font-bold mt-2">{lang.card2Desc}</p>
            </Link>
            <Link href="/nuevo" className="bg-white p-8 rounded-3xl shadow-sm border-2 border-green-100 hover:border-green-400 hover:shadow-md transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">➕</div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{lang.card3Tit}</h2>
              <p className="text-xs text-gray-400 font-bold mt-2">{lang.card3Desc}</p>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // --- VISTA 2: LA PÁGINA DE INICIO PÚBLICA ---
  return (
    <div className="min-h-screen bg-blue-900 bg-cover bg-center flex items-center justify-center relative font-sans" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516214846430-6d4f6470b107?q=80&w=2070')" }}>
      
      <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm"></div>

      {/* SELECTOR DE IDIOMA */}
      <div className="absolute top-6 right-6 z-20 flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
        <button onClick={() => setIdioma('es')} className={`px-3 py-1 rounded-full text-xs font-black transition-all ${idioma === 'es' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/20'}`}>🇪🇸 ES</button>
        <button onClick={() => setIdioma('en')} className={`px-3 py-1 rounded-full text-xs font-black transition-all ${idioma === 'en' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/20'}`}>🇬🇧 EN</button>
      </div>

      <div className="relative z-10 w-full max-w-4xl p-6">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-xl">{lang.titulo}</h1>
          <p className="text-blue-200 font-bold tracking-widest uppercase text-sm mt-4 drop-shadow-md">{lang.subtitulo}</p>
        </div>

        {modo === 'inicio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div onClick={() => setModo('login-cliente')} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer text-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔑</div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{lang.btnCliente}</h2>
              <p className="text-xs text-blue-100 font-bold mt-2">{lang.descCliente}</p>
            </div>
            
            <div onClick={() => setModo('login-admin')} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer text-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💼</div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{lang.btnEmp}</h2>
              <p className="text-xs text-blue-100 font-bold mt-2">{lang.descEmp}</p>
            </div>
          </div>
        )}

        {modo === 'login-cliente' && (
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto transform transition-all">
            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-2">{lang.loginCliTit}</h2>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">{lang.loginCliSub}</p>
            <input type="text" placeholder={lang.loginCliPlace} value={dni} onChange={(e) => setDni(e.target.value)} className="w-full p-4 mb-4 border-2 border-gray-100 rounded-xl font-black text-gray-800 uppercase focus:border-blue-500 outline-none" />
            {errorAcceso && <p className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-widest">{errorAcceso}</p>}
            <button onClick={entrarComoCliente} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">{lang.btnEntrarCli}</button>
            <button onClick={() => {setModo('inicio'); setErrorAcceso('');}} className="w-full text-gray-400 font-bold text-xs mt-4 hover:text-gray-600 uppercase tracking-widest">{lang.btnVolver}</button>
          </div>
        )}

        {modo === 'login-admin' && (
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto transform transition-all">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">{lang.loginEmpTit}</h2>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">{lang.loginEmpSub}</p>
            <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-4 mb-4 border-2 border-gray-100 rounded-xl font-black text-gray-800 text-center tracking-[1em] focus:border-black outline-none" />
            {errorAcceso && <p className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-widest">{errorAcceso}</p>}
            <button onClick={entrarComoAdmin} className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all">{lang.btnEntrarEmp}</button>
            <button onClick={() => {setModo('inicio'); setErrorAcceso('');}} className="w-full text-gray-400 font-bold text-xs mt-4 hover:text-gray-600 uppercase tracking-widest">{lang.btnVolver}</button>
          </div>
        )}

      </div>
    </div>
  )
}