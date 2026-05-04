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
      setClientes(data || [])
      setCargando(false)
    }
    leerClientes()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-600 font-bold text-xs uppercase hover:underline italic">← Inicio</Link>
            <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter mt-1">Clientes</h1>
          </div>
          <Link href="/clientes/nuevo">
            <button className="bg-blue-600 hover:bg-blue-800 text-white text-[10px] font-black px-5 py-3 rounded-full shadow-lg transition-all uppercase tracking-widest active:scale-95">
              + Nuevo Cliente
            </button>
          </Link>
        </div>

        {cargando ? (
          <p className="text-center text-gray-400 font-bold uppercase text-xs animate-pulse">Cargando cartera...</p>
        ) : (
          <div className="grid gap-3">
            {clientes.map(c => {
              const idReal = c.id || c.ID; // Evita el error de undefined
              return (
                <Link href={`/clientes/${idReal}`} key={idReal}>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all flex justify-between items-center cursor-pointer group">
                    <div>
                      <p className="font-black text-gray-800 uppercase group-hover:text-blue-600">{c.nombre}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Saldo: <span className={c.saldo_pendiente > 0 ? 'text-red-500' : 'text-green-500'}>{c.saldo_pendiente || 0}€</span>
                      </p>
                    </div>
                    <span className="text-blue-600 font-bold text-xs uppercase">Ver Ficha →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}