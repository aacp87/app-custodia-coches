'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../../supabase'
import Link from 'next/link'

function FormularioFactura() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Datos automáticos de la URL
  const nombreCliente = searchParams.get('cliente')
  const dniCliente = searchParams.get('dni')

  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardarFactura = async (e) => {
    e.preventDefault()
    setGuardando(false)

    // 1. Insertar la factura
    const { error: errorFactura } = await supabase.from('facturas').insert([
      { 
        dni_cliente: dniCliente,
        nombre_cliente: nombreCliente,
        concepto: concepto,
        monto: parseFloat(monto),
        fecha: new Date().toLocaleDateString(),
        pagado: false
      }
    ])

    if (errorFactura) {
      alert("Error: " + errorFactura.message)
      return
    }

    // 2. ACTUALIZAR LA DEUDA DEL CLIENTE (Sumamos el nuevo monto)
    // Primero leemos la deuda actual
    const { data: cliente } = await supabase.from('clientes').select('saldo_pendiente').eq('dni', dniCliente).single()
    const nuevaDeuda = (cliente.saldo_pendiente || 0) + parseFloat(monto)

    // Actualizamos el saldo en la tabla clientes
    await supabase.from('clientes').update({ saldo_pendiente: nuevaDeuda }).eq('dni', dniCliente)

    alert("✅ Cargo añadido a la cuenta de " + nombreCliente)
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-black text-blue-900 uppercase mb-2 tracking-tighter">Nueva Factura</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-6 italic">Cliente: {nombreCliente}</p>
        
        <form onSubmit={guardarFactura} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Concepto del servicio</label>
            <select 
              value={concepto} 
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 outline-blue-500"
              required
            >
              <option value="">Selecciona servicio...</option>
              <option value="Custodia Mensual">Custodia Mensual</option>
              <option value="Gestión ITV">Gestión ITV</option>
              <option value="Lavado Completo">Lavado Completo</option>
              <option value="Mantenimiento Batería">Mantenimiento Batería</option>
              <option value="Otros">Otros (especificar)</option>
            </select>
          </div>

          {concepto === 'Otros' && (
             <input 
               type="text" 
               placeholder="¿Qué servicio es?" 
               className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-blue-500"
               onChange={(e) => setConcepto(e.target.value)}
             />
          )}

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Precio (€)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-2xl text-blue-600 outline-blue-500 text-center"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={guardando}
            className="w-full bg-black text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest text-xs hover:bg-gray-800 transition-all"
          >
            {guardando ? 'Guardando...' : 'Añadir a la cuenta'}
          </button>
        </form>

        <button onClick={() => router.back()} className="w-full mt-4 text-[10px] font-bold text-gray-400 uppercase italic">Cancelar</button>
      </div>
    </div>
  )
}

export default function NuevaFacturaPage() {
  return <Suspense><FormularioFactura /></Suspense>
}