'use client'
import { useEffect, useState, use, useRef } from 'react'
import { supabase } from '../../../supabase' 
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react' 

export default function FichaCliente({ params }) {
  const resolvedParams = use(params)
  const dniDeLaUrl = resolvedParams.id 
  const fileInputRef = useRef(null) // Referencia para el botón de subir fotos

  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  const [facturas, setFacturas] = useState([])
  const [fotos, setFotos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

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

      const { data: fotosData } = await supabase.from('fotos_coches').select('*').eq('dni_cliente', clienteData.dni).order('created_at', { ascending: false })
      setFotos(fotosData || [])
    }
    setCargando(false)
  }

  useEffect(() => { if (dniDeLaUrl) cargarDatos() }, [dniDeLaUrl])

  // FUNCIÓN PARA SUBIR LA FOTO
  const subirFoto = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    setSubiendoFoto(true)
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${dniDeLaUrl}-${Date.now()}.${extension}`

    const { error: errorSubida } = await supabase.storage.from('fotos_coches').upload(nombreArchivo, archivo)
    
    if (errorSubida) {
      alert("Error al subir: Asegúrate de que el bucket 'fotos_coches' existe en Supabase y es Público.")
      setSubiendoFoto(false)
      return
    }

    const { data: urlPublica } = supabase.storage.from('fotos_coches').getPublicUrl(nombreArchivo)
    await supabase.from('fotos_coches').insert([{ dni_cliente: dniDeLaUrl, url: urlPublica.publicUrl }])

    cargarDatos()
    setSubiendoFoto(false)
  }

  const borrarFoto = async (id, url) => {
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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA CON BOTONES PRINCIPALES */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3 no-print">
               <Link href="/"><span className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-300 transition-all cursor-pointer">🏠 Inicio</span></Link>
               <Link href="/clientes"><span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 transition-all cursor-pointer">← Lista</span></Link>
            </div>
            <h1 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">{cliente.nombre}</h1>
          </div>
          
          {/* BOTONES DE ACCIÓN PARA EL EMPLEADO */}
          <div className="flex flex-wrap gap-3 no-print">
             {/* BOTÓN SUBIR FOTO NUEVO */}
             <button 
                onClick={() => fileInputRef.current.click()}
                disabled={subiendoFoto}
                className={`${subiendoFoto ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'} text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2`}
             >
                {subiendoFoto ? '⌛ Subiendo...' : '📸 Subir Foto'}
             </button>
             <input type="file" ref={fileInputRef} onChange={subirFoto} accept="image/*" className="hidden" />

             <Link href={`/nuevo?cliente=${cliente.nombre}`}>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">+ Añadir Vehículo</button>
             </Link>
             <Link href={`/factura-nueva?cliente=${cliente.nombre}&dni=${cliente.dni}`}>
                <button className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all">+ Crear Factura</button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: CONTACTO */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest italic underline">Ficha de Contacto</h2>
                {!editando ? (
                  <button onClick={() => setEditando(true)} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-700 no-print tracking-widest bg-blue-50 px-2 py-1 rounded">✏️ Editar</button>
                ) : (
                  <button onClick={guardarContacto} className="text-[9px] font-black uppercase text-green-600 hover:text-green-800 no-print tracking-widest bg-green-50 px-2 py-1 rounded">💾 Guardar</button>
                )}
              </div>

              {editando ? (
                <div className="space-y-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <input type="text" value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} className="w-full p-2 border rounded text-xs font-bold" placeholder="Teléfono" />
                  <input type="email" value={nuevoEmail} onChange={(e) => setNuevoEmail(e.target.value)} className="w-full p-2 border rounded text-xs font-bold" placeholder="Email" />
                </div>
              ) : (
                <div className="space-y-2 mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">DNI: <span className="text-gray-800 font-black">{cliente.dni}</span></p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Tel: <span className="text-gray-800 font-black">{cliente.telefono || '---'}</span></p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Email: <span className="text-blue-600 font-black break-all">{cliente.email || '---'}</span></p>
                </div>
              )}

              <div className="border-t pt-6 flex flex-col items-center">
                <QRCodeSVG value={`https://avmenorca.com/clientes/${cliente.dni}`} size={120} level={"H"} includeMargin={true} />
                <p className="text-[10px] font-black text-blue-600 mt-4 uppercase">Escanear para abrir ficha</p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: COCHES, FOTOS Y FACTURAS */}
          <div className="lg:col-span-8 space-y-6 no-print">
            
            {/* GALERÍA DE FOTOS */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Estado del Vehículo (Fotos)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fotos.length === 0 ? (
                  <p className="text-sm font-bold text-gray-300 italic col-span-full">Sin fotos todavía.</p>
                ) : (
                  fotos.map(foto => (
                    <div key={foto.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                      <img src={foto.url} alt="Coche" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => borrarFoto(foto.id, foto.url)}
                        className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-lg"
                      >✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* VEHÍCULOS */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Vehículos en Custodia</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehiculos.map(v => (
                  <div key={v.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center group">
                    <div>
                      <p className="font-black text-gray-800 uppercase">{v.marca_modelo}</p>
                      <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-3 py-1 rounded-full uppercase inline-block mt-1">{v.matricula}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HISTORIAL FACTURAS */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Historial de Visitas</h2>
              <div className="space-y-4">
                {facturas.map((f, index) => (
                  <Link key={f.id} href={`/factura-editar/${f.id}`} className="block">
                    <div className="flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-blue-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">#{facturas.length - index}</div>
                        <div>
                          <p className="font-black text-gray-800 uppercase text-sm">{f.concepto}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{f.fecha}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${f.pagado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>{f.pagado ? 'Pagado' : 'Pendiente'}</span>
                        <p className="font-black text-gray-800 text-lg mt-1">{f.monto}€</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}