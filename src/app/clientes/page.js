'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase' 
import Link from 'next/link'

export default function ListaClientes() {
  const [clientes, setClientes] = useState([])

  useEffect(() => {
    const leer = async () => {
      const { data } = await supabase.from('clientes').select('*').order('nombre')
      setClientes(data || [])
    }
    leer()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-blue-900 uppercase mb-6">Clientes</h1>
        <div className="grid gap-3">
          {clientes.map(c => (
            /* Usamos el DNI como ID para la URL */
            <Link href={`/clientes/${c.dni}`} key={c.dni}>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all flex justify-between items-center cursor-pointer">
                <div>
                  <p className="font-black text-gray-800 uppercase">{c.nombre}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">DNI: {c.dni}</p>
                </div>
                <span className="text-blue-600 font-bold text-xs uppercase">Ver Ficha →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}