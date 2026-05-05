'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'

export default function DiarioPage() {
  const [avisos, setAvisos] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargarDiario = async () => {
    // Pedimos todos los registros a la tabla diario, ordenados alfabéticamente por fecha
    const { data, error } = await supabase.from('diario').select('*').order('fecha', { ascending: true })
    if (!error && data) {
      setAvisos(data)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarDiario()
  }, [])

  // Función para borrar un aviso cuando el cliente ya ha recogido o devuelto el coche
  const borrarAviso = async (id) => {
    if (confirm("¿Confirmas que ya has gestionado este aviso y quieres borrarlo del diario?")) {
      await supabase.from('diario').delete().eq('id', id)
      cargarDiario() // Recargamos la lista
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-5xl mx-auto">
        
        {/* CABECERA */}
        <div className="mb-10">
          <Link href="/">
            <span className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-300 transition-all cursor-pointer">
              🏠 Inicio
            </span>
          </Link>
          <h1 className="text-5xl font-black text-gray-800 uppercase tracking-tighter mt-6">Diario de Entregas</h1>
          <p className="text-gray-500 font-bold mt-2">Control central de llegadas, salidas y notas de todos los clientes.</p>
        </div>

        {/* LISTADO DEL DIARIO */}
        {cargando ? (
          <div className="flex justify-center p-10">
            <p className="font-black text-orange-500 animate-pulse uppercase tracking-widest">Cargando diario...</p>
          </div>
        ) : avisos.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl text-center shadow-sm border border-gray-100">
            <p className="font-black text-gray-400 text-xl uppercase tracking-widest mb-2">El diario está limpio</p>
            <p className="text-sm text-gray-400 font-bold">No hay entregas pendientes. Ve a la ficha de cualquier cliente para programar una nueva llegada.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {avisos.map(aviso => (
              <div key={aviso.id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-2 border-orange-100 flex flex-col md:flex-row justify-between md:items-start gap-6 hover:shadow-md transition-shadow">
                
                <div className="flex-1">
                  {/* Nombre del cliente como enlace a su ficha */}
                  <Link href={`/clientes/${aviso.dni_cliente}`}>
                    <h2 className="text-2xl font-black text-blue-900 hover:text-blue-600 hover:underline uppercase cursor-pointer tracking-tighter">
                      {aviso.cliente}
                    </h2>
                  </Link>
                  <p className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">DNI: {aviso.dni_cliente}</p>
                  
                  {/* Datos del aviso */}
                  <div className="flex flex-col gap-3">
                    <span className="inline-block w-fit bg-orange-100 text-orange-800 font-black text-[11px] px-4 py-1.5 rounded-xl uppercase tracking-widest">
                      📥 LLEGADA: {aviso.fecha}
                    </span>
                    <p className="text-sm font-bold text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {aviso.notas}
                    </p>
                  </div>
                </div>
                
                {/* Botón para marcar como completado */}
                <button 
                  onClick={() => borrarAviso(aviso.id)}
                  className="bg-green-50 text-green-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-green-500 hover:text-white transition-all whitespace-nowrap h-fit border border-green-200 hover:border-green-500"
                >
                  ✓ Completado (Borrar)
                </button>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}