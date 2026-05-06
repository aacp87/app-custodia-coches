'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Inicio() {
  const [modo, setModo] = useState('inicio')
  const [dni, setDni] = useState('')
  const [pass, setPass] = useState('') 
  const [empUser, setEmpUser] = useState('') 
  const [empPass, setEmpPass] = useState('') 
  const [errorAcceso, setErrorAcceso] = useState('')
  const [idioma, setIdioma] = useState('es')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  // Estados para registro cliente
  const [regNombre, setRegNombre] = useState('')
  const [regApellidos, setRegApellidos] = useState('')
  const [regDni, setRegDni] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regMarca, setRegMarca] = useState('')
  const [regMatricula, setRegMatricula] = useState('')

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
      errEmp: "Usuario o contraseña incorrectos.",
      adminTit: "Panel de Control",
      adminSub: "AV MENORCA - Gestión Interna",
      cerrarSesion: "Cerrar Sesión ✕",
      card1Tit: "Directorio Clientes",
      card1Desc: "Buscar y ver fichas.",
      card2Tit: "Diario Entregas",
      card2Desc: "Control de llegadas y salidas.",
      card3Tit: "Alta Nuevo Cliente",
      card3Desc: "Registrar cliente manual (Solo Jefe)."
    },
    en: { /* Omitido por brevedad en la traducción, puedes copiar tus textos en inglés aquí si los usas */ }
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
      // MAGIA AQUÍ: Guardamos el nivel de acceso en el navegador (9 Jefe, 1 Empleado)
      localStorage.setItem('rangoEmpleado', data.nivel || 1)
      setModo('admin-panel')
      setErrorAcceso('')
    } else {
      setErrorAcceso(lang.errEmp)
    }
    setCargando(false)
  }

  // Resto de funciones (entrarComoCliente, registrarCliente, cambiarModo) se mantienen igual
  const entrarComoCliente = async () => {
    if (!dni || !pass) { setErrorAcceso(lang.errDni); return }
    setCargando(true)
    const { data } = await supabase.from('clientes').select('*').eq('dni', dni.trim().toUpperCase()).eq('password', pass).maybeSingle()
    if (data) { router.push(`/mi-portal/${data.dni}?lang=${idioma}`) } else { setErrorAcceso(lang.errDni) }
    setCargando(false)
  }

  const registrarCliente = async () => {
    // ... Tu función de registro exacta
  }

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setErrorAcceso('')
    setEmpUser(''); setEmpPass(''); setDni(''); setPass('');
  }

  const cerrarSesion = () => {
    localStorage.removeItem('rangoEmpleado')
    cambiarModo('inicio')
  }

  if (modo === 'admin-panel') {
    // Leemos el rango (Si no hay, por defecto es 1 'empleado')
    const rango = typeof window !== 'undefined' ? localStorage.getItem('rangoEmpleado') : '1'

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

            {/* SOLO EL JEFE VE EL BOTÓN DE AÑADIR CLIENTE MANUALMENTE */}
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

  // --- RESTO DEL RETURN PRINCIPAL DE LA PORTADA (CÓDIGO ANTERIOR) ---
  return (
      <div className="relative min-h-screen bg-gray-900 font-sans overflow-hidden flex flex-col">
          {/* ... (Todo tu código comercial HTML y los Pop-Ups se quedan exactamente igual) ... */}
          {/* Reemplaza este comentario por el código HTML comercial que ya tenías */}
      </div>
  )
}