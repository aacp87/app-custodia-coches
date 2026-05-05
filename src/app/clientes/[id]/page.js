'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../supabase' 
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react' 

export default function FichaCliente({ params }) {
  const resolvedParams = use(params)
  const dniDeLaUrl = resolvedParams.id 

  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  const [facturas, setFacturas] = useState([])
  const [avisos, setAvisos] = useState([])
  const [cargando, setCargando] = useState(true)

  // ESTADOS DEL NUEVO FORMULARIO (Separado por fechas y horas)
  const [mostrarFormAviso, setMostrarFormAviso] = useState(false)
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [horaEntrega, setHoraEntrega] = useState('')
  const [fechaDevolucion, setFechaDevolucion] = useState('')
  const [horaDevolucion, setHoraDevolucion] = useState('')
  const [notasAviso, setNotasAviso] = useState('')

  const cargarDatos = async () => {
    const { data: clienteData } = await supabase.from('clientes').select('*').eq('dni', dniDeLaUrl).maybeSingle()
    if (clienteData) {
      setCliente(clienteData)
      
      const { data: coches } = await supabase.from('vehiculos').select('*').eq('nombre_cliente', clienteData.nombre)
      setVehiculos(coches || [])
      
      const { data: factu } = await supabase.from('facturas').select('*').eq('dni_cliente', clienteData.dni).order('fecha', { ascending: false })
      setFacturas(factu || [])

      const { data: avisosData } = await supabase.from('diario').select('*').eq('dni_cliente', clienteData.dni).order('fecha', { ascending: true })
      setAvisos(avisosData || [])
    }
    setCargando(false)
  }

  useEffect(() => { if (dniDeLaUrl) cargarDatos() }, [dniDeLaUrl])

  const guardarAviso = async () => {
    if (!fechaEntrega || !horaEntrega || !fechaDevolucion || !horaDevolucion) {
      alert("Por favor, rellena los días y horas tanto de Entrega como de Devolución.")
      return
    }

    // Unimos fecha y hora de entrega para que se ordene bien en la base de datos (YYYY-MM-DD HH:MM)
    const fechaDB = `${fechaEntrega} a las ${horaEntrega}h`
    
    // Creamos un texto bonito con la devolución y las notas
    let notasDB = `📤 SE DEVUELVE EL: ${fechaDevolucion} a las ${horaDevolucion}h.`
    if (notasAviso) {
      notasDB += ` | 📝 NOTAS: ${notasAviso}`
    }

    const { error } = await supabase.from('diario').insert([
      { 
        fecha: fechaDB, 
        cliente: cliente.nombre, 
        dni_cliente: cliente.dni, 
        notas: notasDB 
      }
    ])

    if (error) {
      alert("Error al guardar en el diario: " + error.message)
    } else {
      setMostrarFormAviso(false)
      setFechaEntrega('')
      setHoraEntrega('')
      setFechaDevolucion('')
      setHoraDevolucion('')
      setNotasAviso('')
      cargarDatos() 
    }
  }

  if (cargando) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-white font-black animate-pulse uppercase tracking-widest">Cargando Expediente...</p></div>
  if (!cliente) return <p className="p-10 text-center uppercase font-bold text-red-500">Cliente no encontrado</p>

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3 no-print">
               <Link href="/">
                 <span className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-300 transition-all cursor-pointer">
                   🏠 Inicio
                 </span>
               </Link>
               <Link href="/clientes">
                 <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 transition-all cursor-pointer">
                   ← Lista de Clientes
                 </span>
               </Link>
            </div>
            <h1 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">{cliente.nombre}</h1>
          </div>
          
          <div className="flex gap-3 no-print">
             <Link href={`/nuevo?cliente=${cliente.nombre}`}>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">
                  + Añadir Vehículo
                </button>
             </Link>
             <Link href={`/factura-nueva?cliente=${cliente.nombre}&dni=${cliente.dni}`}>
                <button className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all">
                  + Crear Factura / Visita
                </button>
             </Link>
          </div>
        </div>

        {/* 2 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA 1: CONTACTO Y QR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 italic underline">Ficha de Contacto</h2>
              <div className="space-y-2 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">DNI: <span className="text-gray-800 font-black">{cliente.dni}</span></p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Teléfono: <span className="text-gray-800 font-black">{cliente.telefono}</span></p>
              </div>

              <div className="border-t pt-6 flex flex-col items-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Código QR del Vehículo</p>
                <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-inner">
                  <QRCodeSVG value={`https://avmenorca.com/clientes/${cliente.dni}`} size={120} level={"H"} includeMargin={true} />
                </div>
                <p className="text-[10px] font-black text-blue-600 mt-4 uppercase">Escanear para abrir ficha</p>
                <button onClick={() => window.print()} className="mt-4 text-[9px] font-bold text-gray-300 hover:text-gray-500 uppercase underline no-print">Imprimir etiqueta</button>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: EXPEDIENTE Y VISITAS */}
          <div className="lg:col-span-8 space-y-6 no-print">
            
            {/* SECCIÓN AVISOS DEL DIARIO RE DISEÑADA */}
            <div className="bg-orange-50 p-8 rounded-3xl shadow-sm border border-orange-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-black text-orange-600 uppercase tracking-widest">📅 Avisos y Llegadas (Diario)</h2>
                <button 
                  onClick={() => setMostrarFormAviso(!mostrarFormAviso)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md hover:bg-orange-700 transition-all"
                >
                  {mostrarFormAviso ? 'Cancelar' : '+ Apuntar Llegada'}
                </button>
              </div>

              {/* NUEVO FORMULARIO CON CAMPOS SEPARADOS */}
              {mostrarFormAviso && (
                <div className="bg-white p-6 rounded-2xl shadow-inner border border-orange-100 mb-6 flex flex-col gap-5">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sección Entrega */}
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <label className="block text-[10px] font-black text-orange-800 uppercase tracking-widest mb-2">📥 1. Fecha de Entrega (Llegada)</label>
                      <div className="flex gap-2">
                        <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                        <input type="time" value={horaEntrega} onChange={(e) => setHoraEntrega(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                      </div>
                    </div>

                    {/* Sección Devolución */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <label className="block text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">📤 2. Fecha de Devolución</label>
                      <div className="flex gap-2">
                        <input type="date" value={fechaDevolucion} onChange={(e) => setFechaDevolucion(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                        <input type="time" value={horaDevolucion} onChange={(e) => setHoraDevolucion(e.target.value)} className="p-2 border rounded-lg text-sm w-full font-bold text-gray-700" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">📝 Notas Extra (Opcional)</label>
                    <input type="text" placeholder="Ej: Me deja las llaves en la rueda..." value={notasAviso} onChange={(e) => setNotasAviso(e.target.value)} className="p-3 border rounded-xl text-sm w-full" />
                  </div>

                  <button onClick={guardarAviso} className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all mt-2 w-full md:w-auto self-start">
                    Guardar en el Diario
                  </button>
                </div>
              )}

              {/* LISTA DE AVISOS VISUALMENTE MEJORADA */}
              <div className="space-y-4 mt-4">
                {avisos.length === 0 ? (
                  <p className="text-sm font-bold text-orange-300 italic">No hay próximas llegadas programadas.</p>
                ) : (
                  avisos.map((aviso) => (
                    <div key={aviso.id} className="p-4 bg-white border-2 border-orange-200 rounded-2xl flex flex-col gap-2">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                         <span className="bg-orange-100 text-orange-800 font-black text-[10px] px-3 py-1 rounded-lg uppercase tracking-widest">
                           📥 ENTREGA: {aviso.fecha}
                         </span>
                      </div>
                      <p className="text-sm font-bold text-gray-700 mt-1">{aviso.notas}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECCIÓN COCHES */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Vehículos en Custodia</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehiculos.length === 0 ? (
                  <p className="text-sm font-bold text-gray-300 italic">No hay vehículos registrados.</p>
                ) : (
                  vehiculos.map(v => (
                    <div key={v.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center">
                      <p className="font-black text-gray-800 uppercase">{v.marca_modelo}</p>
                      <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-3 py-1 rounded-full uppercase">{v.matricula}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECCIÓN FACTURAS */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Historial de Visitas y Facturación</h2>
              <div className="space-y-4">
                {facturas.length === 0 ? (
                  <p className="text-sm font-bold text-gray-300 italic">No hay visitas registradas aún.</p>
                ) : (
                  facturas.map((f, index) => (
                    <Link href={`/factura-editar/${f.id}`} key={f.id} className="block group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-2xl group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                            #{facturas.length - index}
                          </div>
                          <div>
                            <p className="font-black text-gray-800 uppercase text-sm">{f.concepto}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fecha de visita: {f.fecha}</p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${f.pagado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                            {f.pagado ? 'Pagado' : 'Pendiente'}
                          </span>
                          <p className="font-black text-gray-800 text-lg">{f.monto}€</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .max-w-7xl { margin: 0; padding: 0; }
        }
      `}</style>
    </div>
  )
}