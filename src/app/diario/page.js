'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export const dynamic = 'force-dynamic' 

export default function Diario() {
  const [servicios, setServicios] = useState([])

  useEffect(() => {
    const leer = async () => {
      // 1. Obtener la fecha de hoy en formato YYYY-MM-DD (igual que Supabase)
      const hoy = new Date().toISOString().split('T')[0];

      // 2. Filtramos para que SOLO salgan los que empiezan HOY
      const { data } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('fecha_inicio', hoy) // <-- Este es el filtro clave
        .order('fecha_inicio', { ascending: true })

      setServicios(data || [])
    }
    leer()
  }, [])

  const formatearFecha = (f) => {
    if(!f) return '--/--/--'
    return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 border-b-2 border-blue-800 pb-2">
            <h1 className="text-xl font-bold text-blue-800 uppercase tracking-tighter">
                Diario de Operaciones - Hoy: {new Date().toLocaleDateString('es-ES')}
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded">
                {servicios.length} SERVICIOS
            </span>
        </div>

        <div className="overflow-x-auto shadow-2xl rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs border-b">
              <tr>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fecha/Hora</th>
                <th className="px-4 py-3 text-left">Lugar</th>
                <th className="px-4 py-3 text-left">Vehículo</th>
                <th className="px-4 py-3 text-left">Cliente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {servicios.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">
                      Collection
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-gray-700">
                    {formatearFecha(s.fecha_inicio)}
                  </td>
                  <td className="px-4 py-4 text-gray-600 uppercase">Aeropuerto</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900">{s.marca_modelo}</div>
                    <div className="text-blue-600 text-xs">{s.matricula}</div>
                  </td>
                  <td className="px-4 py-4 uppercase font-semibold text-gray-900">
                    {s.nombre_cliente || 'Sin nombre'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {servicios.length === 0 && (
            <div className="p-10 text-center">
                <p className="text-gray-500 italic">No hay servicios programados para el día de hoy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}