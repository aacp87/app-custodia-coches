'use client'
import { useEffect, useState, use } from 'react' // Importamos 'use'
import { supabase } from '../../../supabase' 
import Link from 'next/link'

export default function FichaCliente({ params }) {
  const resolvedParams = use(params); // Desempaqueta el ID de la URL
  const id = resolvedParams.id;
  
  const [cliente, setCliente] = useState(null)
  const [facturas, setFacturas] = useState([])
  const [vehiculos, setVehiculos] = useState([])

  const cargarTodo = async () => {
    // 1. Datos del cliente
    const { data: c } = await supabase.from('clientes').select('*').eq('id', id).single()
    setCliente(c)

    // 2. Facturas
    const { data: f } = await supabase.from('facturas').select('*').eq('cliente_id', id).order('fecha', { ascending: false })
    setFacturas(f || [])

    // 3. Vehículos
    if (c) {
      const { data: v } = await supabase.from('vehiculos').select('*').eq('nombre_cliente', c.nombre)
      setVehiculos(v || [])
    }
  }

  useEffect(() => { cargarTodo() }, [id])

  const enviarWhatsApp = () => {
    const msg = `Hola ${cliente.nombre}, recordatorio de deuda pendiente en Autos Victoria: ${cliente.saldo_pendiente}€. Saludos.`
    window.open(`https://wa.me/${cliente.telefono}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (!cliente) return <p className="p-10 uppercase font-bold text-center animate-pulse text-gray-400">Cargando ficha...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <Link href="/clientes" className="text-blue-600 text-xs font-bold uppercase italic">← Volver</Link>
      
      <div className="bg-white p-6 rounded-2xl shadow-md mt-4 border-t-4 border-blue-900">
        <h1 className="text-3xl font-black uppercase text-gray-800">{cliente.nombre}</h1>
        <p className="text-red-600 font-black text-2xl mt-2 uppercase">Deuda: {cliente.saldo_pendiente || 0}€</p>
        
        <button onClick={enviarWhatsApp} className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-xs tracking-widest shadow-lg">
          💬 Enviar WhatsApp
        </button>
      </div>

      <h2 className="mt-8 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Coches del cliente</h2>
      <div className="grid gap-3 mt-2">
        {vehiculos.map(v => (
          <div key={v.id} className="bg-white p-4 rounded-xl flex gap-4 items-center shadow-sm border border-gray-100">
            <p className="font-bold uppercase text-sm">{v.marca_modelo} <span className="text-blue-600">[{v.matricula}]</span></p>
          </div>
        ))}
      </div>
    </div>
  )
}