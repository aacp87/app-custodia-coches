'use client'
import { useEffect, useState } from 'react'
// Ruta corregida: subimos 3 niveles para encontrar supabase.js
import { supabase } from '../../../supabase' 
import Link from 'next/link'

export default function FichaCliente({ params }) {
  const [cliente, setCliente] = useState(null)
  const [facturas, setFacturas] = useState([])
  const [vehiculos, setVehiculos] = useState([])

  const cargarTodo = async () => {
    // 1. Datos del cliente
    const { data: c } = await supabase.from('clientes').select('*').eq('id', params.id).single()
    setCliente(c)

    // 2. Sus facturas vinculadas por cliente_id
    const { data: f } = await supabase.from('facturas').select('*').eq('cliente_id', params.id).order('fecha', { ascending: false })
    setFacturas(f || [])

    // 3. Sus vehículos
    if (c) {
      const { data: v } = await supabase.from('vehiculos').select('*').eq('nombre_cliente', c.nombre)
      setVehiculos(v || [])
    }
  }

  useEffect(() => { cargarTodo() }, [params.id])

  if (!cliente) return <p className="p-10 uppercase font-bold text-center">Cargando Ficha...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <Link href="/clientes" className="text-blue-600 text-xs font-bold uppercase hover:underline">← Volver a Clientes</Link>
      
      {/* CABECERA */}
      <div className="bg-white p-6 rounded-2xl shadow-md mt-4 border-t-4 border-blue-900">
        <h1 className="text-3xl font-black uppercase text-gray-800">{cliente.nombre}</h1>
        <div className="flex justify-between items-end mt-2">
          <p className="text-gray-500 text-sm italic">{cliente.email} | {cliente.telefono}</p>
          <p className="text-red-600 font-black text-2xl uppercase">Deuda: {cliente.saldo_pendiente || 0}€</p>
        </div>
      </div>

      {/* VEHÍCULOS */}
      <h2 className="mt-8 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Vehículos en Custodia</h2>
      <div className="grid gap-3 mt-2">
        {vehiculos.length > 0 ? vehiculos.map(v => (
          <div key={v.id} className="bg-white p-3 rounded-xl flex gap-4 items-center shadow-sm border border-gray-100">
            <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                {v.foto_url && <img src={v.foto_url} className="w-full h-full object-cover" />}
            </div>
            <p className="font-bold uppercase text-sm">{v.marca_modelo} <span className="text-blue-600 ml-2">[{v.matricula}]</span></p>
          </div>
        )) : <p className="text-gray-400 text-xs italic">No hay vehículos registrados.</p>}
      </div>

      {/* FACTURAS */}
      <h2 className="mt-8 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Historial de Cargos</h2>
      <div className="bg-white rounded-xl shadow-sm mt-2 overflow-hidden border border-gray-100">
        {facturas.map(f => (
          <div key={f.id} className="flex justify-between items-center p-4 border-b last:border-0">
            <div>
              <p className="font-bold text-gray-700 uppercase text-sm">{f.concepto}</p>
              <p className="text-[10px] text-gray-400">{f.fecha}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-gray-800">{f.monto}€</p>
              <span className={`text-[9px] font-bold uppercase ${f.pagado ? 'text-green-500' : 'text-red-500'}`}>
                {f.pagado ? 'Pagado' : 'Pendiente'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}