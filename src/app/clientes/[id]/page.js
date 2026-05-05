'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../supabase' 
import Link from 'next/link'

export default function FichaCliente({ params }) {
  // 1. Obtenemos el DNI de la URL de forma segura
  const resolvedParams = use(params)
  const dniDeLaUrl = resolvedParams.id 

  const [cliente, setCliente] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      console.log("Buscando cliente con DNI:", dniDeLaUrl)
      
      // 2. Buscamos en la tabla 'clientes' donde la columna 'dni' sea igual al de la URL
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('dni', dniDeLaUrl)
        .maybeSingle() // Usamos maybeSingle para que no explote si no lo encuentra

      if (error || !data) {
        console.error("Error de Supabase:", error)
        setError(true)
      } else {
        setCliente(data)
      }
    }

    if (dniDeLaUrl) cargarDatos()
  }, [dniDeLaUrl])

  // Si hay error, avisamos
  if (error) return (
    <div className="p-10 text-center">
      <p className="text-red-500 font-bold uppercase">No se encontró el cliente con DNI: {dniDeLaUrl}</p>
      <Link href="/clientes" className="text-blue-500 underline mt-4 inline-block">Volver a la lista</Link>
    </div>
  )

  // Mientras carga
  if (!cliente) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white font-black uppercase tracking-widest animate-pulse">Cargando ficha...</p>
    </div>
  )

  // 3. Diseño de la Ficha cuando ya hay datos
  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen bg-gray-50">
      <Link href="/clientes" className="text-blue-600 font-bold text-xs uppercase italic">← Volver a Clientes</Link>
      
      <div className="bg-white p-8 rounded-3xl shadow-xl mt-4 border-t-8 border-blue-900">
        <h1 className="text-3xl font-black uppercase text-gray-800 tracking-tighter leading-none">
          {cliente.nombre}
        </h1>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DNI / NIE</p>
            <p className="font-bold text-gray-700">{cliente.dni}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Teléfono</p>
            <p className="font-bold text-gray-700">{cliente.telefono}</p>
          </div>
        </div>

        <div className="mt-4 bg-red-50 p-6 rounded-2xl border-2 border-red-100">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Deuda Pendiente</p>
          <p className="text-4xl font-black text-red-600 tracking-tighter">
            {cliente.saldo_pendiente || 0}€
          </p>
        </div>

        <button 
          onClick={() => {
            const msg = `Hola ${cliente.nombre}, te escribo de Autos Victoria para recordarte tu saldo pendiente de ${cliente.saldo_pendiente}€. Un saludo.`
            window.open(`https://wa.me/${cliente.telefono.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
          }}
          className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase tracking-widest text-xs"
        >
          💬 Enviar Recordatorio WhatsApp
        </button>
      </div>
    </div>
  )
}