'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../supabase' 
import Link from 'next/link'

export default function FichaCliente({ params }) {
  const resolvedParams = use(params)
  const dniDeLaUrl = resolvedParams.id 

  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargarDatos = async () => {
    const { data: clienteData } = await supabase.from('clientes').select('*').eq('dni', dniDeLaUrl).maybeSingle()

    if (clienteData) {
      setCliente(clienteData)
      
      // Cargar Vehículos
      const { data: coches } = await supabase.from('vehiculos').select('*').eq('nombre_cliente', clienteData.nombre)
      setVehiculos(coches || [])

      // Cargar Facturas vinculadas al DNI
      const { data: factu } = await supabase.from('facturas').select('*').eq('dni_cliente', clienteData.dni).order('fecha', { ascending: false })
      setFacturas(factu || [])
    }
    setCargando(false)
  }

  useEffect(() => { if (dniDeLaUrl) cargarDatos() }, [dniDeLaUrl])

  if (cargando) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-white font-black animate-pulse uppercase tracking-widest">Cargando Expediente...</p></div>

  if (!cliente) return <p className="p-10 text-center uppercase font-bold text-red-500">Cliente no encontrado</p>

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <Link href="/clientes" className="text-blue-600 font-bold text-[10px] uppercase italic hover:underline tracking-widest">← Volver al Listado</Link>
            <h1 className="text-5xl font-black text-gray-800 uppercase tracking-tighter mt-2">{cliente.nombre}</h1>
          </div>
          <div className="flex gap-3">
             <Link href={`/nuevo?cliente=${cliente.nombre}`}>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                  + Añadir Vehículo
                </button>
             </Link>
             
             <Link href={`/factura-nueva?cliente=${cliente.nombre}&dni=${cliente.dni}`}>
                <button className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all active:scale-95">
                  + Crear Factura
                </button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA 1: CONTACTO Y PAGOS */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 italic underline">Ficha de Contacto</h2>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">DNI: <span className="text-gray-800 font-black">{cliente.dni}</span></p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Teléfono: <span className="text-gray-800 font-black">{cliente.telefono}</span></p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter text-wrap">Email: <span className="text-gray-800 font-black lowercase">{cliente.email}</span></p>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 text-center">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Saldo Total Pendiente</p>
              <p className="text-6xl font-black text-red-600 my-2 tracking-tighter">{cliente.saldo_pendiente || 0}€</p>
              <button 
                onClick={() => {
                    const msg = `Hola ${cliente.nombre}, recordatorio de Autos Victoria. Tienes un saldo pendiente de ${cliente.saldo_pendiente}€. Por favor, contacta con nosotros.`
                    window.open(`https://wa.me/${cliente.telefono.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
                }}
                className="w-full mt-2 bg-green-500 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-green-600 shadow-md transition-all"
              >
                💬 Enviar Recordatorio WhatsApp
              </button>
            </div>
          </div>

          {/* COLUMNA 2: VEHÍCULOS */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-6 italic underline">Flota en Custodia</h2>
            <div className="space-y-6">
              {vehiculos.length > 0 ? vehiculos.map(v => (
                <div key={v.id} className="border-b pb-6 last:border-0 group">
                  <div className="aspect-video w-full bg-gray-100 rounded-2xl mb-3 overflow-hidden border border-gray-100 shadow-inner">
                    {v.foto_url ? (
                      <img src={v.foto_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="Coche" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 font-bold text-[10px] uppercase italic">Sin Fotografía</div>
                    )}
                  </div>
                  <p className="font-black text-gray-800 uppercase text-lg leading-tight">{v.marca_modelo}</p>
                  <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-3 py-1 rounded-full uppercase">{v.matricula}</span>
                </div>
              )) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                  <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest italic">No hay vehículos registrados</p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 3: FACTURAS (CLICABLES PARA EDITAR) */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-6 italic underline">Historial de Cargos</h2>
            <div className="space-y-3">
              {facturas.length > 0 ? facturas.map(f => (
                <Link href={`/factura-editar/${f.id}`} key={f.id} className="block group">
                  <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all cursor-pointer">
                    <div>
                      <p className="font-black text-gray-700 uppercase text-[10px] leading-tight group-hover:text-blue-700 tracking-tighter">
                        {f.concepto || 'Servicio General'}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold mt-1 tracking-wider">{f.fecha}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-800 text-sm tracking-tighter">{f.monto}€</p>
                      <p className={`text-[8px] font-black uppercase mt-1 ${f.pagado ? 'text-green-500' : 'text-red-500'}`}>
                        {f.pagado ? '● PAGADO' : '● PENDIENTE'}
                      </p>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                  <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest italic">No hay facturas emitidas</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}