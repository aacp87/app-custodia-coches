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

      // Cargar Facturas
      const { data: factu } = await supabase.from('facturas').select('*').eq('dni_cliente', clienteData.dni).order('fecha', { ascending: false })
      setFacturas(factu || [])
    }
    setCargando(false)
  }

  useEffect(() => { if (dniDeLaUrl) cargarDatos() }, [dniDeLaUrl])

  if (cargando) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-white font-black animate-pulse">CARGANDO EXPEDIENTE...</p></div>

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link href="/clientes" className="text-blue-600 font-bold text-xs uppercase italic hover:underline">← Volver</Link>
            <h1 className="text-5xl font-black text-gray-800 uppercase tracking-tighter mt-2">{cliente.nombre}</h1>
          </div>
          <div className="flex gap-2">
             <Link href={`/nuevo?cliente=${cliente.nombre}`}>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700">
                  + Añadir Vehículo
                </button>
             </Link>
             <button className="bg-black text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-800">
                + Crear Factura
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA 1: CONTACTO Y PAGOS */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 italic underline">Contacto</h2>
              <p className="text-xs font-bold text-gray-500 uppercase">DNI: <span className="text-gray-800">{cliente.dni}</span></p>
              <p className="text-xs font-bold text-gray-500 uppercase mt-2">TEL: <span className="text-gray-800">{cliente.telefono}</span></p>
              <p className="text-xs font-bold text-gray-500 uppercase mt-2 text-wrap">MAIL: <span className="text-gray-800 lowercase">{cliente.email}</span></p>
            </div>

            <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 text-center">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Saldo Total Pendiente</p>
              <p className="text-5xl font-black text-red-600 my-2">{cliente.saldo_pendiente || 0}€</p>
              <button 
                onClick={() => {
                    const msg = `Hola ${cliente.nombre}, recordatorio de Autos Victoria. Saldo pendiente: ${cliente.saldo_pendiente}€. Saludos.`
                    window.open(`https://wa.me/${cliente.telefono.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
                }}
                className="w-full bg-green-500 text-white font-black py-3 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all"
              >
                💬 Enviar Recordatorio
              </button>
            </div>
          </div>

          {/* COLUMNA 2: VEHÍCULOS */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-6 italic underline">Vehículos en Custodia</h2>
            <div className="space-y-4">
              {vehiculos.length > 0 ? vehiculos.map(v => (
                <div key={v.id} className="border-b pb-4 last:border-0 group">
                  <div className="aspect-video w-full bg-gray-100 rounded-2xl mb-3 overflow-hidden border border-gray-100">
                    {v.foto_url ? (
                      <img src={v.foto_url} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 font-bold text-[10px] uppercase">Sin Foto</div>
                    )}
                  </div>
                  <p className="font-black text-gray-800 uppercase text-sm">{v.marca_modelo}</p>
                  <p className="text-blue-600 font-bold text-xs">{v.matricula}</p>
                </div>
              )) : (
                <p className="text-gray-300 text-xs italic text-center py-10 uppercase font-bold border-2 border-dashed rounded-2xl">Sin vehículos</p>
              )}
            </div>
          </div>

          {/* COLUMNA 3: FACTURAS */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-6 italic underline">Historial de Facturas</h2>
            <div className="space-y-3">
              {facturas.length > 0 ? facturas.map(f => (
                <div key={f.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
                  <div>
                    <p className="font-black text-gray-700 uppercase text-[10px]">{f.concepto || 'Servicio Custodia'}</p>
                    <p className="text-[9px] text-gray-400 font-bold">{f.fecha}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-800 text-sm">{f.monto}€</p>
                    <p className={`text-[8px] font-black uppercase ${f.pagado ? 'text-green-500' : 'text-red-500'}`}>
                      {f.pagado ? 'Pagado' : 'Pendiente'}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-300 text-xs italic text-center py-10 uppercase font-bold border-2 border-dashed rounded-2xl">Sin facturas</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}