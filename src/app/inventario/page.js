'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'

export default function Inventario() {
  const [listaVehiculos, setListaVehiculos] = useState([])

  useEffect(() => {
    const obtenerVehiculos = async () => {
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
        
        {/* BOTÓN PARA VOLVER AL MENÚ DE TARJETAS */}
        <Link href="/" className="text-blue-600 font-bold text-xs mb-4 inline-block hover:underline uppercase tracking-wider">
           ← Volver al Menú Principal
        </Link>

        {/* CABECERA CON TÍTULO Y BOTÓN DE AÑADIR */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-tighter border-l-4 border-blue-900 pl-3">
            Inventario de Vehículos
          </h1>
          
          <div className="flex items-center gap-4">
            {/* BOTÓN VERDE DE AÑADIR */}
            <Link href="/nuevo" className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition-colors shadow-md">
                + AÑADIR VEHÍCULO
            </Link>
            
            <span className="bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                {listaVehiculos.length} TOTAL
            </span>
          </div>
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
                    {v.nombre_cliente || (
                        <span className="text-green-600 font-bold text-xs">DISPONIBLE</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded font-bold transition-colors">
                      VER DETALLES
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {listaVehiculos.length === 0 && (
            <div className="p-10 text-center text-gray-500 italic">
              No se han encontrado vehículos en la base de datos.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 