'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'

export default function Inventario() {
  const [listaVehiculos, setListaVehiculos] = useState([])

  useEffect(() => {
    const obtenerVehiculos = async () => {
      // Traemos todos los vehículos sin filtrar por fecha
      const { data } = await supabase
        .from('vehiculos')
        .select('*')
        .order('marca_modelo', { ascending: true })

      setListaVehiculos(data || [])
    }
    obtenerVehiculos()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-tighter border-l-4 border-blue-900 pl-3">
            Inventario de Vehículos
          </h1>
          <Link href="/diario" className="text-sm font-bold text-blue-600 hover:underline">
            ← Volver al Diario
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-900 text-white uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Matrícula</th>
                <th className="px-6 py-4 text-left">Marca y Modelo</th>
                <th className="px-6 py-4 text-left">Cliente Asignado</th>
                <th className="px-6 py-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listaVehiculos.map((v) => (
                <tr key={v.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-700">
                    {v.matricula}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800 uppercase">
                    {v.marca_modelo}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {v.nombre_cliente || 'Disponible'}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded font-bold">
                      VER DETALLES
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {listaVehiculos.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              Cargando flota de vehículos...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}