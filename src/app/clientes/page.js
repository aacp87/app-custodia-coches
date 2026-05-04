'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase' 
import Link from 'next/link'

export default function ListaClientes() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const leerClientes = async () => {
      const { data } = await supabase.from('clientes').select('*').order('nombre')
      console.log("Datos recibidos de Supabase:", data) // ESTO ES PARA REVISAR
      setClientes(data || [])
      setCargando(false)
    }
    leerClientes()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-blue-900 uppercase mb-6 tracking-tighter">Clientes</h1>
        
        <div className="grid gap-3">
          {clientes.map(c => {
            // Buscamos el ID en cualquier formato posible
            const idParaUrl = c.id || c.ID || c.id_cliente;
            
            return (
              <Link href={`/clientes/${idParaUrl}`} key={idParaUrl} className="block">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all">
                  <p className="font-black text-gray-800 uppercase">{c.nombre}</p>
                  <p className="text-xs text-blue-600 font-bold uppercase mt-1">Ver ficha →</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}