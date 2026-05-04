'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase' // Ajusta la ruta según tu proyecto
import Link from 'next/link'

export default function ListaClientes() {
  const [clientes, setClientes] = useState([])

  useEffect(() => {
    const leerClientes = async () => {
      const { data } = await supabase.from('clientes').select('*').order('nombre')
      setClientes(data || [])
    }
    leerClientes()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-blue-600 font-bold text-xs mb-4 inline-block italic">← INICIO</Link>
        <h1 className="text-2xl font-black text-blue-900 uppercase mb-6">Cartera de Clientes</h1>
        <div className="grid gap-3">
          {clientes.map(c => (
            <Link href={`/clientes/${c.id}`} key={c.id}>
              <div className="bg-white p-4 rounded-xl shadow-sm border hover:border-blue-500 transition-all flex justify-between items-center cursor-pointer">
                <div>
                  <p className="font-bold text-gray-800 uppercase">{c.nombre}</p>
                  <p className="text-[10px] text-gray-400">SALDO: {c.saldo_pendiente}€</p>
                </div>
                <span className="text-blue-600 font-bold">VER FICHA →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}