'use client'
import { useEffect, useState, use, useRef } from 'react'
import { supabase } from '../../../supabase' 
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react' 

export default function FichaCliente({ params }) {
  const resolvedParams = use(params)
  const dniDeLaUrl = resolvedParams.id 
  const fileInputRef = useRef(null)

  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  const [facturas, setFacturas] = useState([])
  const [fotos, setFotos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [pestanaActiva, setPestanaActiva] = useState('vehiculos') 
  
  const [esJefe, setEsJefe] = useState(false)
  const [notasEmpleado, setNotasEmpleado] = useState('')

  const cargarDatos = async () => {
    const { data: clienteData } = await supabase.from('clientes').select('*').eq('dni', dniDeLaUrl).maybeSingle()
    if (clienteData) {
      setCliente(clienteData)
      
      const { data: coches } = await supabase.from('vehiculos').select('*').eq('nombre_cliente', clienteData.nombre)
      setVehiculos(coches || [])
      
      const { data: factu } = await supabase.from('facturas').select('*').eq('dni_cliente', clienteData.dni).order('fecha', { ascending: false })
      setFacturas(factu || [])

      const { data: fotosData } = await supabase.from('fotos_coches').select('*').eq('dni_cliente', clienteData.dni).order('id', { ascending: false })
      setFotos(fotosData || [])
    }
    setCargando(false)
  }

  useEffect(() => { 
    const rango = localStorage.getItem('rangoEmpleado')
    if (rango >= 9) setEsJefe(true)
    if (dniDeLaUrl) cargarDatos() 
  }, [dniDeLaUrl])

  // --- FUNCIONES PARA ITV Y SERVICIO ---
  const actualizarTarea = async (vehiculoId, campo, valor) => {
    const updateData = { [campo]: valor }
    
    // Si estamos terminando una tarea, guardamos también las notas si las hay
    if (campo.includes('finalizado') && valor === true && notasEmpleado) {
        updateData.notas_mecanicas = notasEmpleado
    }

    const { error } = await supabase.from('vehiculos').update(updateData).eq('id', vehiculoId)
    if (!error) {
        setNotasEmpleado('')
        cargarDatos()
        alert("✅ Estado actualizado")
    }
  }

  const subirFoto = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    setSubiendoFoto(true)
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${dniDeLaUrl}-${Date.now()}.${extension}`
    try {
      await supabase.storage.from('fotos_coches').upload(nombreArchivo, archivo)
      const { data: urlPublica } = supabase.storage.from('fotos_coches').getPublicUrl(nombreArchivo)
      await supabase.from('fotos_coches').insert([{ dni_cliente: dniDeLaUrl, url: urlPublica.publicUrl }])
      await cargarDatos()
      setPestanaActiva('fotos') 
    } catch (err) { alert(err.message) } finally { setSubiendoFoto(false) }
  }

  if (cargando) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-white font-black animate-pulse uppercase tracking-widest">Cargando...</p></div>
  if (!cliente) return <p className="p-10 text-center uppercase font-bold text-red-500">Cliente no encontrado</p>

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <Link href="/"><span className="bg-white border border-gray-200 text-gray-400 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-black transition-all cursor-pointer shadow-sm">🏠 Inicio</span></Link>
               <Link href="/clientes"><span className="bg-white border border-gray-200 text-gray-400 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-black transition-all cursor-pointer shadow-sm">← Lista</span></Link>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none">{cliente.nombre}</h1>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <button onClick={() => fileInputRef.current?.click()} disabled={subiendoFoto} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all">
                {subiendoFoto ? 'Subiendo...' : '📸 Foto Estado'}
             </button>
             <input type="file" ref={fileInputRef} onChange={subirFoto} accept="image/*" capture="environment" className="hidden" />
             {esJefe && (
                 <Link href={`/factura-nueva?cliente=${cliente.nombre}&dni=${cliente.dni}`}>
                    <button className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gray-300 hover:bg-gray-800 transition-all">+ Factura</button>
                 </Link>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* INFO CLIENTE IZQUIERDA */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 sticky top-8">
              <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 border-b pb-4 italic">Información del Cliente</h2>
              <div className="space-y-4 mb-8">
                  <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">DNI</p><p className="text-xl font-black text-gray-800">{cliente.dni}</p></div>
                  <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Teléfono</p><p className="text-xl font-black text-gray-800">{cliente.telefono || '---'}</p></div>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center">
                <QRCodeSVG value={`https://avmenorca.com/clientes/${cliente.dni}`} size={140} level={"H"} />
                <p className="text-[10px] font-black text-gray-400 mt-6 uppercase tracking-[0.2em]">Escaneo Rápido</p>
              </div>
            </div>
          </div>

          {/* GESTIÓN DE VEHÍCULOS Y TAREAS */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
              
              <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50/50">
                <button onClick={() => setPestanaActiva('vehiculos')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${pestanaActiva === 'vehiculos' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  🚗 Vehículos y Tareas ({vehiculos.length})
                </button>
                {esJefe && (
                    <button onClick={() => setPestanaActiva('facturas')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${pestanaActiva === 'facturas' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                      📄 Facturas ({facturas.length})
                    </button>
                )}
                <button onClick={() => setPestanaActiva('fotos')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${pestanaActiva === 'fotos' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  🖼️ Fotos ({fotos.length})
                </button>
              </div>

              <div className="p-8">
                {pestanaActiva === 'vehiculos' && (
                  <div className="space-y-8">
                    {vehiculos.map(v => (
                      <div key={v.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-widest">Vehículo en Custodia</p>
                                <h3 className="text-2xl font-black text-gray-900 uppercase leading-none">{v.marca_modelo}</h3>
                                <span className="inline-block mt-2 bg-blue-900 text-white text-[10px] font-black px-3 py-1 rounded-lg">{v.matricula}</span>
                            </div>
                            <div className="text-4xl opacity-20">🚗</div>
                        </div>

                        {/* SECCIÓN DE TAREAS (ITV Y SERVICIO) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* CAJA ITV */}
                            <div className={`p-4 rounded-2xl border-2 transition-all ${v.itv_solicitado ? 'bg-white border-orange-200 shadow-md' : 'bg-gray-100 border-transparent opacity-60'}`}>
                                <p className="text-[10px] font-black uppercase mb-2">🔍 Inspección ITV</p>
                                
                                {!v.itv_solicitado ? (
                                    esJefe ? (
                                        <button onClick={() => actualizarTarea(v.id, 'itv_solicitado', true)} className="w-full bg-blue-600 text-white py-2 rounded-xl text-[9px] font-black uppercase">Solicitar ITV</button>
                                    ) : <p className="text-[9px] font-bold text-gray-400 italic">No solicitado</p>
                                ) : v.itv_finalizado ? (
                                    <div className="text-green-600 font-black text-[10px] flex items-center gap-2">✅ ITV REALIZADA</div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="bg-orange-100 text-orange-700 font-black text-[9px] p-2 rounded-lg text-center animate-pulse">PENDIENTE DE ITV</div>
                                        <textarea placeholder="¿Algún problema?" value={notasEmpleado} onChange={(e) => setNotasEmpleado(e.target.value)} className="w-full p-2 text-[10px] border rounded-lg h-12 outline-none focus:border-blue-400" />
                                        <button onClick={() => actualizarTarea(v.id, 'itv_finalizado', true)} className="w-full bg-green-500 text-white py-2 rounded-xl text-[9px] font-black uppercase">Marcar como Hecho</button>
                                    </div>
                                )}
                            </div>

                            {/* CAJA SERVICIO */}
                            <div className={`p-4 rounded-2xl border-2 transition-all ${v.servicio_solicitado ? 'bg-white border-blue-200 shadow-md' : 'bg-gray-100 border-transparent opacity-60'}`}>
                                <p className="text-[10px] font-black uppercase mb-2">🛠️ Servicio / Mecánica</p>
                                
                                {!v.servicio_solicitado ? (
                                    esJefe ? (
                                        <button onClick={() => actualizarTarea(v.id, 'servicio_solicitado', true)} className="w-full bg-blue-600 text-white py-2 rounded-xl text-[9px] font-black uppercase">Solicitar Servicio</button>
                                    ) : <p className="text-[9px] font-bold text-gray-400 italic">No solicitado</p>
                                ) : v.servicio_finalizado ? (
                                    <div className="text-green-600 font-black text-[10px] flex items-center gap-2">✅ SERVICIO REALIZADO</div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="bg-blue-100 text-blue-700 font-black text-[9px] p-2 rounded-lg text-center animate-pulse">PENDIENTE DE SERVICIO</div>
                                        <textarea placeholder="¿Algún problema?" value={notasEmpleado} onChange={(e) => setNotasEmpleado(e.target.value)} className="w-full p-2 text-[10px] border rounded-lg h-12 outline-none focus:border-blue-400" />
                                        <button onClick={() => actualizarTarea(v.id, 'servicio_finalizado', true)} className="w-full bg-green-500 text-white py-2 rounded-xl text-[9px] font-black uppercase">Marcar como Hecho</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* NOTAS MECÁNICAS SI LAS HAY */}
                        {v.notas_mecanicas && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                                <p className="text-[9px] font-black uppercase text-yellow-700 mb-1">Notas del operario:</p>
                                <p className="text-xs font-bold text-gray-700">"{v.notas_mecanicas}"</p>
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* ... (RESTO DE PESTAÑAS: FACTURAS Y FOTOS) ... */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}