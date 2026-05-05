'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../supabase'
import Link from 'next/link'

export default function PortalCliente({ params }) {
  const resolvedParams = use(params)
  const dniCliente = resolvedParams.id 

  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  
  // Formulario de Reserva
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [horaEntrega, setHoraEntrega] = useState('')
  const [fechaDevolucion, setFechaDevolucion] = useState('')
  const [horaDevolucion, setHoraDevolucion] = useState('')
  const [notas, setNotas] = useState('')
  
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: clienteData } = await supabase.from('clientes').select('*').eq('dni', dniCliente).maybeSingle()
      if (clienteData) {
        setCliente(clienteData)
        const { data: coches } = await supabase.from('vehiculos').select('*').eq('nombre_cliente', clienteData.nombre)
        setVehiculos(coches || [])
      }
    }
    cargarDatos()
  }, [dniCliente])

  const solicitarReserva = async () => {
    if (!fechaEntrega || !horaEntrega || !fechaDevolucion || !horaDevolucion) {
      alert("Por favor, rellena todos los días y horas.")
      return
    }

    // Preparamos los datos EXACTAMENTE igual que tu Diario para que funcione automático
    const fechaDB = `${fechaEntrega} a las ${horaEntrega}h`
    let notasDB = `📤 SE DEVUELVE EL: ${fechaDevolucion} a las ${horaDevolucion}h.`
    if (notas) notasDB += ` | 📝 NOTA DEL CLIENTE: ${notas}`

    const { error } = await supabase.from('diario').insert([
      { 
        fecha: fechaDB, 
        cliente: cliente.nombre, 
        dni_cliente: cliente.dni, 
        notas: notasDB 
      }
    ])

    if (!error) {
      setEnviado(true)
    }
  }

  if (!cliente) return <div className="min-h-screen bg-blue-900 flex items-center justify-center text-white font-black animate-pulse uppercase tracking-widest">Cargando tu portal...</div>

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* CABECERA PÚBLICA */}
      <div className="bg-blue-900 text-white p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Autos Victoria</h1>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Portal del Cliente</p>
          </div>
          <Link href="/">
            <button className="text-blue-200 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
              Cerrar Sesión ✕
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* BIENVENIDA */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Hola, {cliente.nombre}</h2>
          <p className="text-gray-500 font-bold mt-2">Desde aquí puedes avisarnos de tu próxima visita a Menorca.</p>
        </div>

        {/* TUS VEHÍCULOS */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Vehículos en Custodia</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehiculos.map(v => (
                <div key={v.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center">
                  <p className="font-black text-gray-800 uppercase">{v.marca_modelo}</p>
                  <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-3 py-1 rounded-full uppercase">{v.matricula}</span>
                </div>
              ))}
           </div>
        </div>

        {/* FORMULARIO DE RESERVA */}
        <div className="bg-orange-50 p-8 rounded-3xl shadow-sm border border-orange-100">
          <h3 className="text-xl font-black text-orange-800 uppercase tracking-tighter mb-2">Programar Recogida</h3>
          <p className="text-xs font-bold text-orange-600/80 mb-6 uppercase tracking-widest">Avísanos para tener tu coche preparado</p>

          {enviado ? (
            <div className="bg-green-100 text-green-800 p-8 rounded-2xl text-center border border-green-200">
              <div className="text-4xl mb-4">✅</div>
              <h4 className="font-black uppercase tracking-widest mb-2">¡Aviso enviado!</h4>
              <p className="text-sm font-bold">Hemos anotado tus fechas en nuestra agenda. Tendremos tu coche listo.</p>
              <button onClick={() => setEnviado(false)} className="mt-6 text-xs font-black text-green-600 uppercase underline">Programar otro aviso</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-inner">
                  <label className="block text-[10px] font-black text-orange-800 uppercase tracking-widest mb-2">Llegada (Recoger el coche)</label>
                  <div className="flex gap-2">
                    <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                    <input type="time" value={horaEntrega} onChange={(e) => setHoraEntrega(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-inner">
                  <label className="block text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">Salida (Devolver el coche)</label>
                  <div className="flex gap-2">
                    <input type="date" value={fechaDevolucion} onChange={(e) => setFechaDevolucion(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                    <input type="time" value={horaDevolucion} onChange={(e) => setHoraDevolucion(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">¿Alguna nota o petición especial?</label>
                <input type="text" placeholder="Ej: Llego en el vuelo de Ryanair a las 10:15..." value={notas} onChange={(e) => setNotas(e.target.value)} className="p-3 border border-gray-200 rounded-xl text-sm w-full font-bold text-gray-700" />
              </div>

              <button onClick={solicitarReserva} className="bg-orange-600 text-white px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-lg hover:bg-orange-700 transition-all w-full">
                Enviar Fechas a Autos Victoria
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}