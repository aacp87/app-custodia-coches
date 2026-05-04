'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export const dynamic = 'force-dynamic'

export default function VistaEmpleados() {
  const [tareas, setTareas] = useState([])

  useEffect(() => {
    const leerTareas = async () => {
      const { data } = await supabase
        .from('vehiculos')
        .select('*')
        .order('fecha_inicio', { ascending: true })
      setTareas(data || [])
    }
    leerTareas()
  }, [])

  const formatearFecha = (f) => new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
  const formatearHora = (f) => new Date(f).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4 text-yellow-400 border-b border-yellow-400 pb-2 flex justify-between items-center">
          PLANNING EQUIPO
          <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded">HOY</span>
        </h1>

        <div className="space-y-4">
          {tareas.map((t) => (
            <div key={t.id} className="bg-gray-800 rounded-xl p-4 border-l-8 border-yellow-500 shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Cliente</p>
                  <p className="text-lg font-bold text-white uppercase">{t.nombre_cliente}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase">Matrícula</p>
                  <p className="text-lg font-black text-yellow-400 tracking-wider">{t.matricula}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-700">
                <div className="bg-gray-700 p-2 rounded">
                  <p className="text-[10px] text-gray-400 uppercase">Entrega (Inicio)</p>
                  <p className="font-bold text-sm">{formatearFecha(t.fecha_inicio)} - {formatearHora(t.fecha_inicio)}</p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <p className="text-[10px] text-gray-400 uppercase">Recogida (Fin)</p>
                  <p className="font-bold text-sm">{formatearFecha(t.fecha_recogida)} - {formatearHora(t.fecha_recogida)}</p>
                </div>
              </div>
              
              <div className="mt-3">
                 <p className="text-[10px] text-gray-400 uppercase">Ubicación</p>
                 <p className="text-sm font-semibold">📍 AEROPUERTO</p>
              </div>
            </div>
          ))}

          {tareas.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No hay tareas para hoy.</p>
          )}
        </div>
      </div>
    </div>
  )
}