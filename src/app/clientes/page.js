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
          
          {/* BOTÓN PARA AÑADIR NUEVO CLIENTE */}
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
            {clientes.length > 0 ? clientes.map(c => (
              <Link href={`/clientes/${c.id}`} key={c.id}>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all flex justify-between items-center cursor-pointer group">
                  <div>
                    <p className="font-black text-gray-800 uppercase group-hover:text-blue-600 transition-colors">{c.nombre}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Saldo: <span className={c.saldo_pendiente > 0 ? 'text-red-500' : 'text-green-500'}>{c.saldo_pendiente || 0}€</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 group-hover:bg-blue-50 p-2 rounded-full transition-colors">
                    <span className="text-blue-600 font-bold text-xs uppercase">Ver Ficha</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="text-center p-10 border-2 border-dashed rounded-2xl border-gray-200">
                <p className="text-gray-400 text-sm font-bold uppercase">No hay clientes todavía</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}