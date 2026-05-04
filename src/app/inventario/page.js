'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'

export default function Inventario() {
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerVehiculos()
  }, [])

  async function obtenerVehiculos() {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .order('fecha_entrada', { ascending: false })

    if (error) {
      console.error('Error al obtener vehículos:', error)
    } else {
      setVehiculos(data)
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Coches en Custodia</h1>
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + Registrar Nuevo
          </Link>
        </div>

        {cargando ? (
          <p className="text-center text-gray-600">Cargando inventario...</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehiculos.map((v) => (
                  <tr key={v.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{v.matricula}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{v.marca_modelo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(v.fecha_entrada).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {v.estado || 'En nave'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vehiculos.length === 0 && (
              <p className="p-8 text-center text-gray-500">No hay vehículos registrados todavía.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}