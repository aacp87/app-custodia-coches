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
  const [idioma, setIdioma] = useState('es')
  const router = useRouter()

  const t = {
    es: {
      titulo: "AV MENORCA",
      subtitulo: "Tranquilidad total para tu vehículo",
      titPrincipal: "Custodia de Vehículos",
      subPrincipal: "Premium en Menorca",
      descComercial: "¿Tienes casa de vacaciones en la isla? Nosotros guardamos tu coche, moto o barco en nuestra nave segura y te lo entregamos lavado y a punto directamente en el aeropuerto a tu llegada.",
      tag1: "✈️ Entrega en Aeropuerto",
      tag2: "🛡️ Nave Segura",
      tag3: "✨ Lavado Incluido",
      btnWhatsApp: "Contactar por WhatsApp",
      btnEmail: "Enviar Email",
      btnCliente: "🔑 Acceso Clientes",
      btnEmp: "💼 Empleados",
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
      adminSub: "AV MENORCA - Modo Empleado",
      cerrarSesion: "Cerrar Sesión ✕",
      card1Tit: "Directorio Clientes",
      card1Desc: "Buscar, ver fichas y gestionar.",
      card2Tit: "Diario Entregas",
      card2Desc: "Control de llegadas y salidas.",
      card3Tit: "Alta Nuevo Cliente",
      card3Desc: "Registrar cliente y vehículo."
    },
    en: {
      titulo: "AV MENORCA",
      subtitulo: "Total peace of mind for your vehicle",
      titPrincipal: "Premium Vehicle Custody",
      subPrincipal: "in Menorca",
      descComercial: "Do you have a holiday home on the island? We store your car, bike or boat in our secure facility and deliver it clean and ready directly to the airport upon your arrival.",
      tag1: "✈️ Airport Delivery",
      tag2: "🛡️ Secure Facility",
      tag3: "✨ Cleaning Included",
      btnWhatsApp: "Contact via WhatsApp",
      btnEmail: "Send Email",
      btnCliente: "🔑 Client Access",
      btnEmp: "💼 Employees",
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
      adminSub: "AV MENORCA - Employee Mode",
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
      router.push(`/mi-portal/${data.dni}?lang=${idioma}`) 
    } else {
      setErrorAcceso(lang.errDni)
    }
  }

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

  return (
    <div className="relative min-h-screen bg-gray-900 font-sans overflow-hidden">
      
      {/* IMAGEN DE FONDO PREMIUM (Coche de lujo / ambiente elegante) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083&auto=format&fit=crop" 
          alt="Coche premium custodia Menorca"
          className="w-full h-full object-cover opacity-60 scale-105"
        />
        {/* Degradado para oscurecer y que el texto se lea perfecto */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-gray-900/70 to-black/90"></div>
      </div>

      <header className="relative z-50 w-full p-6 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10">
        <div className="text-white font-black text-3xl tracking-tighter drop-shadow-md">
          {lang.titulo}
        </div>
        
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className="flex gap-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 mr-2">
            <button onClick={() => setIdioma('es')} className={`px-3 py-1 rounded-full text-xs font-black transition-all ${idioma === 'es' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/20'}`}>ES</button>
            <button onClick={() => setIdioma('en')} className={`px-3 py-1 rounded-full text-xs font-black transition-all ${idioma === 'en' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/20'}`}>EN</button>
          </div>

          <button onClick={() => setModo('login-cliente')} className="text-[10px] font-black text-white uppercase tracking-widest bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full backdrop-blur-md transition-all">
            {lang.btnCliente}
          </button>
          <button onClick={() => setModo('login-admin')} className="text-[10px] font-black text-white uppercase tracking-widest bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full shadow-lg shadow-blue-900/50 transition-all">
            {lang.btnEmp}
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center max-w-5xl mx-auto py-10">
        
        {modo === 'inicio' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <span className="text-blue-400 font-black tracking-[0.4em] uppercase text-xs sm:text-sm mb-6 block drop-shadow-lg">
              {lang.subtitulo}
            </span>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
              {lang.titPrincipal} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-sm">
                {lang.subPrincipal}
              </span>
            </h1>
            
            {/* TEXTO DE VENTAS (Casa de vacaciones / Aeropuerto) */}
            <p className="text-lg md:text-2xl text-gray-200 mb-8 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {lang.descComercial}
            </p>

            {/* ETIQUETAS DE SERVICIOS (Tags) */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <span className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm">{lang.tag1}</span>
              <span className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm">{lang.tag2}</span>
              <span className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm">{lang.tag3}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto">
              <a href="https://wa.me/34609629380" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-green-500 text-white px-8 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-green-600 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-500/20">
                <span className="text-xl">💬</span> {lang.btnWhatsApp}
              </a>
              <a href="mailto:avictoria@infotelecom.es" className="w-full sm:w-auto bg-white text-blue-950 px-8 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-gray-100 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/10">
                <span className="text-xl">✉️</span> {lang.btnEmail}
              </a>
            </div>
          </div>
        )}

        {/* ... (POP-UPS DE LOGIN SIGUEN EXACTAMENTE IGUAL) ... */}
        {modo === 'login-cliente' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md mx-auto w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-2">{lang.loginCliTit}</h2>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">{lang.loginCliSub}</p>
            <input type="text" placeholder={lang.loginCliPlace} value={dni} onChange={(e) => setDni(e.target.value)} className="w-full p-4 mb-4 border-2 border-gray-100 rounded-xl font-black text-gray-800 uppercase focus:border-blue-500 outline-none" />
            {errorAcceso && <p className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-widest">{errorAcceso}</p>}
            <button onClick={entrarComoCliente} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">{lang.btnEntrarCli}</button>
            <button onClick={() => {setModo('inicio'); setErrorAcceso('');}} className="w-full text-gray-400 font-bold text-xs mt-4 hover:text-gray-600 uppercase tracking-widest">{lang.btnVolver}</button>
          </div>
        )}

        {modo === 'login-admin' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md mx-auto w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-5xl mb-4">💼</div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">{lang.loginEmpTit}</h2>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">{lang.loginEmpSub}</p>
            <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && entrarComoAdmin()} className="w-full p-4 mb-4 border-2 border-gray-100 rounded-xl font-black text-gray-800 text-center tracking-[1em] focus:border-black outline-none" />
            {errorAcceso && <p className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-widest">{errorAcceso}</p>}
            <button onClick={entrarComoAdmin} className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all">{lang.btnEntrarEmp}</button>
            <button onClick={() => {setModo('inicio'); setErrorAcceso('');}} className="w-full text-gray-400 font-bold text-xs mt-4 hover:text-gray-600 uppercase tracking-widest">{lang.btnVolver}</button>
          </div>
        )}
      </main>
    </div>
  )
}