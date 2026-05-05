'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../../supabase'
import Link from 'next/link'

function FormularioFactura() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const nombreCliente = searchParams.get('cliente')
  const dniCliente = searchParams.get('dni')

  const [servicios, setServicios] = useState([])
  const [seleccion, setSeleccion] = useState('')
  const [nuevoServicio, setNuevoServicio] = useState('')
  const [monto, setMonto] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const cargarServicios = async () => {
      const { data } = await supabase.from('servicios_frecuentes').select('nombre').order('nombre')
      setServicios(data || [])
    }
    cargarServicios()
  }, [])

  const guardarFactura = async (e) => {
    e.preventDefault()
    setGuardando(true)

    const conceptoFinal = seleccion === 'OTRO' ? nuevoServicio.toUpperCase() : seleccion

    const { error: errorFactura } = await supabase.from('facturas').insert([
      { 
        dni_cliente: dniCliente,
        nombre_cliente: nombreCliente,
        concepto: conceptoFinal,
        monto: parseFloat(monto),
        fecha: new Date().toLocaleDateString(),
        pagado: false
      }
    ])

    if (errorFactura) {
      alert("Error: " + errorFactura.message)
      setGuardando(false)
      return
    }

    if (seleccion === 'OTRO' && nuevoServicio) {
      await supabase.from('servicios_frecuentes').upsert([{ nombre: conceptoFinal }])
    }

    const { data: cliente } = await supabase.from('clientes').select('saldo_pendiente').eq('dni', dniCliente).single()
    const nuevaDeuda = (cliente.saldo_pendiente || 0) + parseFloat(monto)
    await supabase.from('clientes').update({ saldo_pendiente: nuevaDeuda }).eq('dni', dniCliente)

    alert("✅ Cargo de " + conceptoFinal + " añadido")
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-black text-blue-900 uppercase mb-2 tracking-tighter text-center">Nueva Factura</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-6 text-center italic tracking-widest">Para: {nombreCliente}</p>
        
        <form onSubmit={guardarFactura} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Servicio</label>
            <select 
              value={seleccion} 
              onChange={(e) => setSeleccion(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-800 outline-blue-500 shadow-inner mt-1"
              required
            >
              <option value="">Selecciona servicio...</option>
              {servicios.map((s, index) => (
                <option key={index} value={s.nombre}>{s.nombre}</option>
              ))}
              <option value="OTRO" className="text-blue-600 font-black">+ AÑADIR NUEVO SERVICIO...</option>
            </select>
          </div>

          {seleccion === 'OTRO' && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-300">
               <label className="text-[10px] font-black text-blue-600 uppercase ml-2 tracking-widest">Escribe el nuevo servicio</label>
               <input 
                 type="text" 
                 placeholder="EJ: CUSTODIA ANUAL" 
                 /* CAMBIO CRÍTICO: Fondo blanco, texto negro y borde marcado */
                 className="w-full p-4 bg-white border-2 border-blue-500 rounded-2xl font-black text-gray-900 outline-none shadow-md mt-1 uppercase placeholder:text-gray-300"
                 value={nuevoServicio}
                 onChange={(e) => setNuevoServicio(e.target.value)}
                 required
                 autoFocus
               />
             </div>
          )}

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Precio (€)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-4xl text-blue-600 outline-blue-500 text-center shadow-inner mt-1"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={guardando}
            className="w-full bg-black text-white font-black py-5 rounded-2xl shadow-lg uppercase tracking-widest text-xs hover:bg-gray-800 transition-all active:scale-95 disabled:bg-gray-400 mt-4"
          >
            {guardando ? 'Guardando...' : 'Añadir a la cuenta'}
          </button>
        </form>

        <button onClick={() => router.back()} className="w-full mt-6 text-[10px] font-bold text-gray-300 uppercase italic hover:text-red-500 transition-colors text-center">← Cancelar</button>
      </div>
    </div>
  )
}

export default function NuevaFacturaPage() {
  return <Suspense fallback={<p className="text-center p-10 font-black uppercase">Cargando...</p>}><FormularioFactura /></Suspense>
}