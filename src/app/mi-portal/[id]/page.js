'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../../supabase'
import Link from 'next/link'

export default function PortalCliente({ params }) {
  const resolvedParams = use(params)
  const dniCliente = resolvedParams.id 
  
  const [idioma, setIdioma] = useState('es')
  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [horaEntrega, setHoraEntrega] = useState('')
  const [fechaDevolucion, setFechaDevolucion] = useState('')
  const [horaDevolucion, setHoraDevolucion] = useState('')
  const [notas, setNotas] = useState('')
  const [emailCliente, setEmailCliente] = useState('') 
  
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const t = {
    es: {
      portTit: "Portal del Cliente",
      cerrar: "Cerrar Sesión ✕",
      hola: "Hola",
      desc: "Desde aquí puedes avisarnos de tu próxima visita a Menorca.",
      cochesTit: "Vehículos en Custodia",
      formTit: "Programar Recogida",
      formSub: "Avísanos para tener tu coche preparado",
      llegada: "Llegada (Recoger el coche)",
      salida: "Salida (Devolver el coche)",
      emailLoc: "Tu correo electrónico (Para enviarte la confirmación)",
      notasLoc: "¿Alguna nota o petición especial?",
      notasPlace: "Ej: Llego en el vuelo de Ryanair a las 10:15...",
      btnEnviar: "Enviar Fechas a AV Menorca",
      btnEnviando: "Enviando...",
      okTit: "¡Aviso enviado y guardado!",
      okDesc: "Hemos anotado tus fechas y te hemos enviado un email de confirmación.",
      btnWa: "Notificar por WhatsApp a la oficina",
      btnOtro: "Programar otro aviso",
      cargando: "Cargando tu portal...",
      errVacio: "Por favor, rellena todos los campos y tu email."
    },
    en: {
      portTit: "Client Portal",
      cerrar: "Log Out ✕",
      hola: "Hello",
      desc: "From here you can notify us of your next visit to Menorca.",
      cochesTit: "Vehicles in Custody",
      formTit: "Schedule Pickup",
      formSub: "Let us know so we can have your car ready",
      llegada: "Arrival (Pick up the car)",
      salida: "Departure (Return the car)",
      emailLoc: "Your email address (To send you the confirmation)",
      notasLoc: "Any special requests or notes?",
      notasPlace: "Ex: Arriving on Ryanair flight at 10:15...",
      btnEnviar: "Send Dates to AV Menorca",
      btnEnviando: "Sending...",
      okTit: "Notice sent and saved!",
      okDesc: "We have noted your dates and sent you a confirmation email.",
      btnWa: "Notify the office via WhatsApp",
      btnOtro: "Schedule another notice",
      cargando: "Loading your portal...",
      errVacio: "Please fill in all fields and your email."
    }
  }

  const lang = t[idioma]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const idiomaUrl = searchParams.get('lang')
      if (idiomaUrl) setIdioma(idiomaUrl)
    }

    const cargarDatos = async () => {
      const { data: clienteData } = await supabase.from('clientes').select('*').eq('dni', dniCliente).maybeSingle()
      if (clienteData) {
        setCliente(clienteData)
        if (clienteData.email) setEmailCliente(clienteData.email) // <--- AUTO-RELLENO DE EMAIL
        
        const { data: coches } = await supabase.from('vehiculos').select('*').eq('nombre_cliente', clienteData.nombre)
        setVehiculos(coches || [])
      }
    }
    cargarDatos()
  }, [dniCliente])

  const solicitarReserva = async () => {
    if (!fechaEntrega || !horaEntrega || !fechaDevolucion || !horaDevolucion || !emailCliente) {
      alert(lang.errVacio)
      return
    }

    setEnviando(true)

    const fechaLlegadaTxt = `${fechaEntrega} a las ${horaEntrega}h`
    const fechaSalidaTxt = `${fechaDevolucion} a las ${horaDevolucion}h`
    
    let notasDB = `📤 SE DEVUELVE EL: ${fechaSalidaTxt}.`
    if (notas) notasDB += ` | 📝 NOTA: ${notas}`

    const { error } = await supabase.from('diario').insert([
      { fecha: fechaLlegadaTxt, cliente: cliente.nombre, dni_cliente: cliente.dni, notas: notasDB }
    ])

    if (!error) {
      await fetch('/api/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailCliente, nombreCliente: cliente.nombre, idioma, llegada: fechaLlegadaTxt, salida: fechaSalidaTxt, notas })
      })
      
      // Si el cliente pone un email nuevo en la cajita, lo actualizamos en la base de datos automáticamente
      if (emailCliente !== cliente.email) {
        await supabase.from('clientes').update({ email: emailCliente }).eq('dni', cliente.dni)
      }
      
      setEnviado(true)
    }
    setEnviando(false)
  }

  const TELEFONO_EMPRESA = '34600000000'; // Pon tu móvil aquí
  const textoWhatsapp = idioma === 'es' 
    ? `Hola AV Menorca! Acabo de enviar mis fechas por la web. 🚗\nLlegada: ${fechaEntrega} a las ${horaEntrega}h.\nSalida: ${fechaDevolucion} a las ${horaDevolucion}h.`
    : `Hello AV Menorca! I just sent my dates via the website. 🚗\nArrival: ${fechaEntrega} at ${horaEntrega}h.\nDeparture: ${fechaDevolucion} at ${horaDevolucion}h.`;
  const linkWhatsapp = `https://wa.me/${TELEFONO_EMPRESA}?text=${encodeURIComponent(textoWhatsapp)}`;

  if (!cliente) return <div className="min-h-screen bg-blue-900 flex items-center justify-center text-white font-black animate-pulse uppercase tracking-widest">{lang.cargando}</div>

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="bg-blue-900 text-white p-6 relative">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black uppercase tracking-tighter">AV Menorca</h1>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">{lang.portTit}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2 bg-blue-950/50 p-1 rounded-full border border-white/10">
              <button onClick={() => setIdioma('es')} className={`px-2 py-1 rounded-full text-[10px] font-black transition-all ${idioma === 'es' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/20'}`}>🇪🇸 ES</button>
              <button onClick={() => setIdioma('en')} className={`px-2 py-1 rounded-full text-[10px] font-black transition-all ${idioma === 'en' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/20'}`}>🇬🇧 EN</button>
            </div>
            <Link href="/"><button className="text-blue-200 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">{lang.cerrar}</button></Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">{lang.hola}, {cliente.nombre}</h2>
          <p className="text-gray-500 font-bold mt-2">{lang.desc}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{lang.cochesTit}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehiculos.map(v => (
                <div key={v.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center">
                  <p className="font-black text-gray-800 uppercase">{v.marca_modelo}</p>
                  <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-3 py-1 rounded-full uppercase">{v.matricula}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-orange-50 p-8 rounded-3xl shadow-sm border border-orange-100">
          <h3 className="text-xl font-black text-orange-800 uppercase tracking-tighter mb-2">{lang.formTit}</h3>
          <p className="text-xs font-bold text-orange-600/80 mb-6 uppercase tracking-widest">{lang.formSub}</p>

          {enviado ? (
            <div className="bg-green-100 text-green-800 p-8 rounded-2xl text-center border border-green-200">
              <div className="text-4xl mb-4">✅</div>
              <h4 className="font-black uppercase tracking-widest mb-2">{lang.okTit}</h4>
              <p className="text-sm font-bold mb-6">{lang.okDesc}</p>
              <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer" className="block w-full md:w-auto bg-[#25D366] text-white px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-lg hover:bg-[#1ebd5a] transition-all mx-auto mb-4">
                💬 {lang.btnWa}
              </a>
              <button onClick={() => setEnviado(false)} className="mt-4 text-xs font-black text-green-700 uppercase underline">{lang.btnOtro}</button>
            </div>
          ) : (
            <div className="space-y-6">
              
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">📧 {lang.emailLoc}</label>
                <input type="email" placeholder="ejemplo@correo.com" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} className="p-3 border border-gray-200 rounded-xl text-sm w-full font-bold text-gray-700 focus:border-orange-500 outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-inner">
                  <label className="block text-[10px] font-black text-orange-800 uppercase tracking-widest mb-2">📥 {lang.llegada}</label>
                  <div className="flex gap-2">
                    <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                    <input type="time" value={horaEntrega} onChange={(e) => setHoraEntrega(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-inner">
                  <label className="block text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">📤 {lang.salida}</label>
                  <div className="flex gap-2">
                    <input type="date" value={fechaDevolucion} onChange={(e) => setFechaDevolucion(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                    <input type="time" value={horaDevolucion} onChange={(e) => setHoraDevolucion(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{lang.notasLoc}</label>
                <input type="text" placeholder={lang.notasPlace} value={notas} onChange={(e) => setNotas(e.target.value)} className="p-3 border border-gray-200 rounded-xl text-sm w-full font-bold text-gray-700" />
              </div>

              <button disabled={enviando} onClick={solicitarReserva} className="bg-orange-600 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-lg hover:bg-orange-700 transition-all w-full">
                {enviando ? lang.btnEnviando : lang.btnEnviar}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}