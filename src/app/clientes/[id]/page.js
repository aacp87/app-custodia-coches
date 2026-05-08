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
  const [editando, setEditando] = useState(false)
  const [nuevoTelefono, setNuevoTelefono] = useState('')
  const [nuevoEmail, setNuevoEmail] = useState('')

  const cargarDatos = async () => {
    const { data: clienteData } = await supabase.from('clientes').select('*').eq('dni', dniDeLaUrl).maybeSingle()
    if (clienteData) {
      setCliente(clienteData)
      setNuevoTelefono(clienteData.telefono || '')
      setNuevoEmail(clienteData.email || '')
      
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

  const borrarFoto = async (id, url) => {
    if (!esJefe) return alert("No tienes permisos para borrar fotos.")
    if (confirm('¿Borrar esta fotografía?')) {
      const nombreArchivo = url.split('/').pop()
      await supabase.storage.from('fotos_coches').remove([nombreArchivo])
      await supabase.from('fotos_coches').delete().eq('id', id)
      cargarDatos()
    }
  }

  const guardarContacto = async () => {
    const { error } = await supabase.from('clientes').update({ telefono: nuevoTelefono, email: nuevoEmail }).eq('dni', dniDeLaUrl)
    if (!error) {
      setCliente({ ...cliente, telefono: nuevoTelefono, email: nuevoEmail })
      setEditando(false) 
    }
  }

  if (cargando) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-white font-black animate-pulse uppercase tracking-widest">Cargando...</p></div>
  if (!cliente) return <p className="p-10 text-center uppercase font-bold text-red-500">Cliente no encontrado</p>

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto">
        
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
          
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 sticky top-8">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Ficha de Contacto</h2>
                {esJefe && !editando && (<button onClick={() => setEditando(true)} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded">✏️ Editar</button>)}
                {esJefe && editando && (<button onClick={guardarContacto} className="text-[9px] font-black uppercase text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded">💾 Guardar</button>)}
              </div>
              {editando ? (
                <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <input type="text" value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} className="w-full p-2 border rounded text-xs font-bold" placeholder="Teléfono" />
                  <input type="email" value={nuevoEmail} onChange={(e) => setNuevoEmail(e.target.value)} className="w-full p-2 border rounded text-xs font-bold" placeholder="Email" />
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">DNI</p><p className="text-xl font-black text-gray-800">{cliente.dni}</p></div>
                  <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Teléfono</p><p className="text-xl font-black text-gray-800">{cliente.telefono || '---'}</p></div>
                  <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Email</p><p className="font-bold text-blue-600 text-sm break-all">{cliente.email || '---'}</p></div>
                </div>
              )}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center">
                <QRCodeSVG value={`https://avmenorca.com/clientes/${cliente.dni}`} size={140} level={"H"} />
                <p className="text-[10px] font-black text-gray-400 mt-6 uppercase tracking-[0.2em]">Escaneo Rápido</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
              
              <div className="flex flex-wrap border-b border-gray-100 p-2 gap-2 bg-gray-50/50">
                <button onClick={() => setPestanaActiva('vehiculos')} className={`flex-1 py-4 px-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${pestanaActiva === 'vehiculos' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  🚗 Vehículos ({vehiculos.length})
                </button>
                {esJefe && (
                    <button onClick={() => setPestanaActiva('facturas')} className={`flex-1 py-4 px-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${pestanaActiva === 'facturas' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                      📄 Facturas ({facturas.length})
                    </button>
                )}
                <button onClick={() => setPestanaActiva('fotos')} className={`flex-1 py-4 px-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${pestanaActiva === 'fotos' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  🖼️ Fotos ({fotos.length})
                </button>
              </div>

              <div className="p-8">
                
                {pestanaActiva === 'vehiculos' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehiculos.length === 0 ? (
                      <p className="text-sm font-bold text-gray-300 italic py-10 text-center col-span-full">No hay vehículos.</p>
                    ) : (
                      vehiculos.map(v => (
                        <div key={v.id} className="p-6 bg-gray-900 text-white rounded-3xl flex justify-between items-center shadow-lg">
                          <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Vehículo</p>
                            <p className="font-black text-lg uppercase leading-tight">{v.marca_modelo}</p>
                            <p className="text-blue-300 font-black text-xs mt-2 bg-blue-900/50 inline-block px-3 py-1 rounded-lg">{v.matricula}</p>
                          </div>
                          <div className="opacity-20 text-4xl">🚗</div>
                        </div>
                      ))
                    )}
                    {esJefe && (
                        <Link href={`/nuevo?cliente=${cliente.nombre}`} className="border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center p-6 text-gray-400 font-black text-[10px] uppercase hover:bg-gray-50 transition-all">
                          + Añadir Vehículo
                        </Link>
                    )}
                  </div>
                )}

                {pestanaActiva === 'facturas' && esJefe && (
                  <div className="space-y-4">
                    {facturas.length === 0 ? (
                      <p className="text-sm font-bold text-gray-300 italic py-10 text-center">No hay facturas registradas.</p>
                    ) : (
                      facturas.map((f, i) => (
                        <Link key={f.id} href={`/factura-editar/${f.id}`}>
                          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">#{facturas.length - i}</div>
                              <div>
                                <p className="font-black text-gray-900 uppercase text-sm">{f.conceptos || f.concepto}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{f.fecha}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-xl text-gray-900">{f.monto}€</p>
                              <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg ${f.pagado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{f.pagado ? 'Pagado' : 'Pendiente'}</span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {pestanaActiva === 'fotos' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {fotos.length === 0 ? (
                      <div className="col-span-full py-20 text-center">
                        <p className="text-4xl mb-4 opacity-20">📸</p>
                        <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Sin fotos todavía</p>
                      </div>
                    ) : (
                      fotos.map(foto => (
                        <div key={foto.id} className="relative group rounded-2xl overflow-hidden border-4 border-gray-50 aspect-square shadow-sm bg-gray-100">
                          <img src={foto.url} alt="Coche" className="w-full h-full object-cover" />
                          {esJefe && (
                              <button onClick={() => borrarFoto(foto.id, foto.url)} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-bold">✕</button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}