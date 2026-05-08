'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Inicio() {
  // AHORA EL ESTADO INICIAL ES LA PANTALLA DE CONSTRUCCIÓN
  const [modo, setModo] = useState('construccion') 
  
  const [dni, setDni] = useState('')
  const [pass, setPass] = useState('') 
  const [empUser, setEmpUser] = useState('') 
  const [empPass, setEmpPass] = useState('') 
  const [errorAcceso, setErrorAcceso] = useState('')
  const [idioma, setIdioma] = useState('es')
  const [cargando, setCargando] = useState(false)
  const [rango, setRango] = useState(1) 
  const router = useRouter()

  const [regNombre, setRegNombre] = useState('')
  const [regApellidos, setRegApellidos] = useState('')
  const [regDni, setRegDni] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regMarca, setRegMarca] = useState('')
  const [regMatricula, setRegMatricula] = useState('')

  useEffect(() => {
    const rangoGuardado = localStorage.getItem('rangoEmpleado')
    if (rangoGuardado) setRango(Number(rangoGuardado))
  }, [modo])

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
      loginCliSub: "Introduce tu DNI y Contraseña",
      loginCliPlace: "DNI o Pasaporte",
      loginCliPass: "Contraseña",
      btnEntrarCli: "Entrar a mi portal",
      noCuenta: "¿No tienes cuenta? Regístrate aquí",
      btnVolver: "← Volver",
      errDni: "Credenciales incorrectas. Revisa los datos.",
      regTit: "Nuevo Registro",
      regSub: "Crea tu cuenta y añade tu vehículo",
      regNombre: "Nombre",
      regApellidos: "Apellidos",
      regMarca: "Marca y Modelo (Ej: Opel Corsa)",
      regMatricula: "Matrícula (Ej: 1234ABC)",
      btnCrear: "Crear Cuenta Segura",
      yaCuenta: "← Ya tengo cuenta",
      errRegFaltan: "Por favor, rellena todos los campos.",
      errRegExiste: "Este DNI ya está registrado.",
      loginEmpTit: "Acceso Personal",
      loginEmpSub: "Introduce tus credenciales de empleado",
      btnEntrarEmp: "Acceder al Sistema",
      errEmp: "Usuario o contraseña de empleado incorrectos.",
      adminTit: "Panel de Control",
      adminSub: "AV MENORCA - Gestión Interna",
      cerrarSesion: "Cerrar Sesión ✕",
      card1Tit: "Directorio Clientes",
      card1Desc: "Buscar, ver fichas y gestionar.",
      card2Tit: "Diario Entregas",
      card2Desc: "Control de llegadas y salidas.",
      card3Tit: "Alta Nuevo Cliente",
      card3Desc: "Registrar cliente manual."
    },
    en: { /* ... Inglés ... */ }
  }

  const lang = t[idioma] || t.es

  const entrarComoAdmin = async () => {
    if (!empUser || !empPass) {
      setErrorAcceso(lang.errEmp)
      return
    }
    setCargando(true)
    setErrorAcceso('')

    const { data, error } = await supabase
      .from('seguridad_empleados')
      .select('*')
      .eq('usuario', empUser.trim())
      .eq('password', empPass.trim())
      .maybeSingle()

    if (data) {
      localStorage.setItem('rangoEmpleado', data.nivel || 1)
      setRango(data.nivel || 1)
      setModo('admin-panel')
      setErrorAcceso('')
    } else {
      setErrorAcceso(lang.errEmp)
    }
    setCargando(false)
  }

  const entrarComoCliente = async () => {
    if (!dni || !pass) {
      setErrorAcceso(lang.errDni)
      return
    }
    setCargando(true)
    setErrorAcceso('')
    const { data } = await supabase.from('clientes').select('*').eq('dni', dni.trim().toUpperCase()).eq('password', pass).maybeSingle()
    if (data) {
      router.push(`/mi-portal/${data.dni}?lang=${idioma}`) 
    } else {
      setErrorAcceso(lang.errDni)
    }
    setCargando(false)
  }

  const registrarCliente = async () => {
    if (!regNombre || !regApellidos || !regDni || !regPass || !regMarca || !regMatricula) {
      setErrorAcceso(lang.errRegFaltan)
      return
    }
    setCargando(true)
    const dniMayus = regDni.trim().toUpperCase()
    const nombreCompleto = `${regNombre.trim()} ${regApellidos.trim()}`
    const { data: existe } = await supabase.from('clientes').select('dni').eq('dni', dniMayus).maybeSingle()
    if (existe) {
      setErrorAcceso(lang.errRegExiste)
      setCargando(false)
      return
    }
    await supabase.from('clientes').insert([{ dni: dniMayus, nombre: nombreCompleto, password: regPass }])
    await supabase.from('vehiculos').insert([{ nombre_cliente: nombreCompleto, marca_modelo: regMarca, matricula: regMatricula.toUpperCase() }])
    router.push(`/mi-portal/${dniMayus}?lang=${idioma}`)
  }

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setErrorAcceso('')
    setEmpUser('')
    setEmpPass('')
    setDni('')
    setPass('')
  }

  const cerrarSesion = () => {
    localStorage.removeItem('rangoEmpleado')
    setRango(1)
    cambiarModo('construccion') // Al cerrar sesión te manda a la pantalla de construcción
  }


  // --- VISTA 0: EN CONSTRUCCIÓN ---
  if (modo === 'construccion') {
    return (
      <div className="relative min-h-screen bg-gray-950 font-sans flex flex-col items-center justify-center overflow-hidden">
        {/* Fondo oscuro */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083&auto=format&fit=crop" alt="Fondo" className="w-full h-full object-cover opacity-20 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/90 to-black"></div>
        </div>
        
        {/* Contenido En Construcción */}
        <div className="relative z-10 text-center px-4">
          <div className="text-6xl mb-6 opacity-80">🚧</div>
          
          {/* EL TRUCO ESTÁ AQUÍ: Al hacer doble clic en el título, te lleva al inicio */}
          <h1 
            onDoubleClick={() => setModo('inicio')} 
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest mb-4 cursor-default select-none"
            title="Doble clic para acceso admin"
          >
            AV MENORCA
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-400 font-bold tracking-[0.2em] uppercase">
            Página en construcción
          </p>
          <p className="mt-8 text-sm text-gray-500 font-bold uppercase tracking-widest">
            Estaremos operativos próximamente
          </p>
        </div>
      </div>
    )
  }

  // --- VISTA 1: EL PANEL DE ADMINISTRADOR ---
  if (modo === 'admin-panel') {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
        <div className="max-w-5xl mx-auto text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">{lang.adminTit}</h1>
              <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px] mt-1">
                {rango >= 9 ? '👑 MODO JEFE (ACCESO TOTAL)' : '👨‍🔧 MODO EMPLEADO'}
              </p>
            </div>
            <button onClick={cerrarSesion} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">
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
            
            {rango >= 9 && (
              <Link href="/nuevo" className="bg-white p-8 rounded-3xl shadow-sm border-2 border-green-100 hover:border-green-400 hover:shadow-md transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">➕</div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{lang.card3Tit}</h2>
                <p className="text-xs text-gray-400 font-bold mt-2">{lang.card3Desc}</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- VISTA 2: LA PÁGINA DE INICIO PÚBLICA (Solo se ve si haces doble clic en el título) ---
  return (
    <div className="relative min-h-screen bg-gray-900 font-sans overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083&auto=format&fit=crop" alt="Fondo" className="w-full h-full object-cover opacity-60 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-gray-900/70 to-black/90"></div>
      </div>

      <header className="relative z-50 w-full p-6 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10">
        <div className="text-white font-black text-3xl tracking-tighter">{lang.titulo}</div>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className="flex gap-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20">
            <button onClick={() => setIdioma('es')} className={`px-3 py-1 rounded-full text-xs font-black ${idioma === 'es' ? 'bg-white text-blue-900' : 'text-white'}`}>ES</button>
            <button onClick={() => setIdioma('en')} className={`px-3 py-1 rounded-full text-xs font-black ${idioma === 'en' ? 'bg-white text-blue-900' : 'text-white'}`}>EN</button>
          </div>
          <button onClick={() => cambiarModo('login-cliente')} className="text-[10px] font-black text-white uppercase tracking-widest bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full backdrop-blur-md transition-all">{lang.btnCliente}</button>
          <button onClick={() => cambiarModo('login-admin')} className="text-[10px] font-black text-white uppercase tracking-widest bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full transition-all">{lang.btnEmp}</button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-5xl mx-auto w-full">
        {modo === 'inicio' && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <span className="text-blue-400 font-black tracking-[0.4em] uppercase text-xs mb-6 block">{lang.subtitulo}</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">{lang.titPrincipal} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{lang.subPrincipal}</span></h1>
            <p className="text-lg md:text-2xl text-gray-200 mb-8 font-medium max-w-3xl mx-auto leading-relaxed">{lang.descComercial}</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto">
              <a href="https://wa.me/34600000000" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-green-500 text-white px-8 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-500/20"><span className="text-xl">💬</span> {lang.btnWhatsApp}</a>
              <a href="mailto:info@avmenorca.com" className="w-full sm:w-auto bg-white text-blue-950 px-8 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/10"><span className="text-xl">✉️</span> {lang.btnEmail}</a>
            </div>
            
            {/* Botón para volver a ocultar la web */}
            <button onClick={() => setModo('construccion')} className="mt-12 text-[10px] text-gray-500 hover:text-gray-300 font-black uppercase tracking-widest">
              ← Volver al modo Construcción
            </button>
          </div>
        )}

        {modo === 'login-cliente' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md mx-auto w-full text-center">
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-2">{lang.loginCliTit}</h2>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">{lang.loginCliSub}</p>
            <input type="text" placeholder={lang.loginCliPlace} value={dni} onChange={(e) => setDni(e.target.value)} className="w-full p-4 mb-3 border-2 border-gray-100 rounded-xl font-black text-gray-800 uppercase focus:border-blue-500 outline-none" />
            <input type="password" placeholder={lang.loginCliPass} value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && entrarComoCliente()} className="w-full p-4 mb-4 border-2 border-gray-100 rounded-xl font-black text-gray-800 focus:border-blue-500 outline-none" />
            {errorAcceso && <p className="text-red-500 text-[10px] font-black uppercase mb-4 text-center">{errorAcceso}</p>}
            <button onClick={entrarComoCliente} disabled={cargando} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">{cargando ? '⌛...' : lang.btnEntrarCli}</button>
            <div className="mt-6 border-t pt-4">
              <button onClick={() => cambiarModo('registro-cliente')} className="text-blue-600 font-black text-xs hover:text-blue-800 uppercase tracking-widest block w-full mb-3">{lang.noCuenta}</button>
              <button onClick={() => cambiarModo('inicio')} className="text-gray-400 font-bold text-xs hover:text-gray-600 uppercase tracking-widest">{lang.btnVolver}</button>
            </div>
          </div>
        )}

        {modo === 'registro-cliente' && (
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-lg mx-auto w-full">
            <div className="text-center mb-6"><div className="text-4xl mb-2">📝</div><h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight">{lang.regTit}</h2><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{lang.regSub}</p></div>
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder={lang.regNombre} value={regNombre} onChange={(e) => setRegNombre(e.target.value)} className="w-full p-3 border-2 border-gray-100 rounded-xl font-bold text-sm text-gray-800 focus:border-blue-500 outline-none" />
                <input type="text" placeholder={lang.regApellidos} value={regApellidos} onChange={(e) => setRegApellidos(e.target.value)} className="w-full p-3 border-2 border-gray-100 rounded-xl font-bold text-sm text-gray-800 focus:border-blue-500 outline-none" />
              </div>
              <input type="text" placeholder={lang.loginCliPlace} value={regDni} onChange={(e) => setRegDni(e.target.value)} className="w-full p-3 border-2 border-gray-100 rounded-xl font-bold text-sm text-gray-800 uppercase focus:border-blue-500 outline-none" />
              <input type="password" placeholder={lang.loginCliPass} value={regPass} onChange={(e) => setRegPass(e.target.value)} className="w-full p-3 border-2 border-gray-100 rounded-xl font-bold text-sm text-gray-800 focus:border-blue-500 outline-none" />
              <div className="border-t border-gray-100 my-4 pt-4 text-center"><p className="text-[10px] text-gray-400 font-black uppercase mb-3">Datos del Vehículo</p>
                <input type="text" placeholder={lang.regMarca} value={regMarca} onChange={(e) => setRegMarca(e.target.value)} className="w-full p-3 mb-3 border-2 border-gray-100 rounded-xl font-bold text-sm text-gray-800 focus:border-blue-500 outline-none" />
                <input type="text" placeholder={lang.regMatricula} value={regMatricula} onChange={(e) => setRegMatricula(e.target.value)} className="w-full p-3 border-2 border-gray-100 rounded-xl font-bold text-sm text-gray-800 uppercase focus:border-blue-500 outline-none" />
              </div>
            </div>
            {errorAcceso && <p className="text-red-500 text-[10px] font-black uppercase mb-4 text-center">{errorAcceso}</p>}
            <button onClick={registrarCliente} disabled={cargando} className="w-full bg-green-500 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-green-600 transition-all">{cargando ? '⌛...' : lang.btnCrear}</button>
            <div className="mt-4 text-center"><button onClick={() => cambiarModo('login-cliente')} className="text-gray-400 font-bold text-xs uppercase tracking-widest">{lang.yaCuenta}</button></div>
          </div>
        )}

        {modo === 'login-admin' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md mx-auto w-full text-center">
            <div className="text-5xl mb-4">💼</div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">{lang.loginEmpTit}</h2>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">{lang.loginEmpSub}</p>
            <input type="text" placeholder="USUARIO" value={empUser} onChange={(e) => setEmpUser(e.target.value)} className="w-full p-4 mb-3 border-2 border-gray-100 rounded-xl font-black text-gray-800 focus:border-black outline-none" />
            <input type="password" placeholder="CONTRASEÑA" value={empPass} onChange={(e) => setEmpPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && entrarComoAdmin()} className="w-full p-4 mb-4 border-2 border-gray-100 rounded-xl font-black text-gray-800 focus:border-black outline-none" />
            {errorAcceso && <p className="text-red-500 text-[10px] font-black uppercase mb-4 text-center">{errorAcceso}</p>}
            <button onClick={entrarComoAdmin} disabled={cargando} className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all">{cargando ? '⌛...' : lang.btnEntrarEmp}</button>
            <button onClick={() => cambiarModo('inicio')} className="text-gray-400 font-bold text-xs mt-4 hover:text-gray-600 uppercase tracking-widest">{lang.btnVolver}</button>
          </div>
        )}
      </main>
    </div>
  )
}