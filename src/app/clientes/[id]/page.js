'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase' // Ajusta la ruta según tu proyecto
import Link from 'next/link'

export default function FichaCliente({ params }) {
  const [cliente, setCliente] = useState(null)
  const [facturas, setFacturas] = useState([])
  const [vehiculos, setVehiculos] = useState([])

  const cargarTodo = async () => {
    const { data: c } = await supabase.from('clientes').select('*').eq('id', params.id).single()
    setCliente(c)

    const { data: f } = await supabase.from('facturas').select('*').eq('cliente_id', params.id)
    setFacturas(f || [])

    if (c) {
      const { data: v } = await supabase.from('vehiculos').select('*').eq('nombre_cliente', c.nombre)
      setVehiculos(v || [])
    }
  }

  useEffect(() => { cargarTodo() }, [params.id])

  if (!cliente) return <p className="p-10 uppercase font-bold">Cargando...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <Link href="/clientes" className="text-blue-600 text-xs font-bold uppercase">← Volver</Link>
      
      <div className="bg-white p-6 rounded-2xl shadow-md mt-4 border-t-4 border-blue-900">
        <h1 className="text-3xl font-black uppercase text-gray-800">{cliente.nombre}</h1>
        <p className="text-red-600 font-black text-xl mt-2">DEUDA: {cliente.saldo_pendiente}€</p>
      </div>

      <h2 className="mt-8 font-bold text-gray-400 text-xs uppercase">Coches de este cliente</h2>
      {vehiculos.map(v => (
        <div key={v.id} className="bg-white p-3 rounded-lg mt-2 flex gap-4 items-center shadow-sm">
          <img src={v.foto_url} className="w-16 h-12 object-cover rounded" />
          <p className="font-bold uppercase text-sm">{v.marca_modelo} ({v.matricula})</p>
        </div>
      ))}
    </div>
  )
}