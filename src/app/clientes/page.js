'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')

  const cargarClientes = async () => {
    const { data } = await supabase.from('clientes').select('*').order('nombre', { ascending: true })
    if (data) setClientes(data)
  }

  useEffect(() => { cargarClientes() }, [])

  // FUNCIÓN PARA BORRAR UN CLIENTE Y TODA SU INFORMACIÓN
  const borrarCliente = async (dni, nombre) => {
    const confirmacion = window.confirm(`⚠️ ¡ATENCIÓN! Vas a borrar al cliente ${nombre}.\n\nEsto también borrará para siempre todos sus COCHES, FACTURAS y AVISOS del diario.\n\n¿Estás completamente seguro?`)
    
    if (confirmacion) {
      // Borrado en cascada para no dejar basura en la base de datos
      await supabase.from('diario').delete().eq('dni_cliente', dni)
      await supabase.from('facturas').delete().eq('dni_cliente', dni)
      await supabase.from('vehiculos').delete().eq('nombre_cliente', nombre)
      await supabase.from('clientes').delete().eq('dni', dni)
      
      cargarClientes() // Recarga la lista
    }
  }

  // Lógica del buscador
  const filtrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.dni.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Clientes</h1>
           <Link href="/">
             <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-300 transition-all cursor-pointer">
               🏠 Inicio
             </span>
           </Link>
        </div>
        
        {/* BUSCADOR DE CLIENTES */}
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre o DNI..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-4 mb-8 rounded-2xl border-2 border-gray-100 shadow-sm text-sm font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
        />

        <div className="space-y-4">
          {filtrados.map(cliente => (
            <div key={cliente.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-all">
              <div>
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">{cliente.nombre}</h2>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1 uppercase">DNI: {cliente.dni}</p>
              </div>
              <div className="flex items-center gap-4">
                {/* BOTÓN BORRAR CLIENTE */}
                <button 
                  onClick={() => borrarCliente(cliente.dni, cliente.nombre)}
                  className="text-red-400 hover:text-red-600 font-black text-[10px] uppercase tracking-widest px-2 transition-colors"
                  title="Borrar Cliente"
                >
                  ✕ Borrar
                </button>
                <Link href={`/clientes/${cliente.dni}`}>
                  <span className="text-blue-600 font-black text-[11px] uppercase tracking-widest hover:underline cursor-pointer">
                    Ver Ficha →
                  </span>
                </Link>
              </div>
            </div>
          ))}
          {filtrados.length === 0 && (
            <p className="text-center text-gray-400 font-bold p-10 uppercase tracking-widest text-xs">No se encontraron clientes.</p>
          )}
        </div>
      </div>
    </div>
  )
}