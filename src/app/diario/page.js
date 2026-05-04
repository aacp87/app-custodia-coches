'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export const dynamic = 'force-dynamic' 

export default function Diario() {
  const [servicios, setServicios] = useState([])

  useEffect(() => {
    const leer = async () => {
      const { data } = await supabase.from('vehiculos').select('*').order('fecha_inicio', { ascending: true })
      setServicios(data || [])
    }
    leer()
  }, [])

  // Esta función hace que la fecha se vea 07/07/26
  const formatearFecha = (f) => {
    if(!f) return '--/--/--'
    return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold mb-4 text-blue-800 border-b-2 border-blue-800 pb-2 uppercase tracking-tighter">Diario de Operaciones - Aeropuerto</h1>
        <div className="overflow-x-auto shadow-2xl rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-800 text-white uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Fechas (Rango)</th>
                <th className="px-4 py-3 text-left">Lugar</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Vehículo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {servicios.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50 border-l-4 border-blue-500">
                  <td className="px-4 py-4 font-bold text-gray-700 whitespace-nowrap">
                    {formatearFecha(s.fecha_inicio)} al {formatearFecha(s.fecha_recogida)}
                  </td>
                  <td className="px-4 py-4 text-gray-600 font-bold uppercase">Aeropuerto</td>
                  <td className="px-4 py-4 uppercase font-semibold text-gray-900">{s.nombre_cliente || 'Sin nombre'}</td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-blue-600">{s.matricula}</span>
                    <span className="ml-2 text-gray-500">({s.marca_modelo})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {servicios.length === 0 && <p className="p-10 text-center text-gray-500">No hay servicios programados.</p>}
        </div>
      </div>
    </div>
  )
}