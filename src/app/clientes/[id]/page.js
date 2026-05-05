'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../supabase' 
import Link from 'next/link'

export default function FichaCliente({ params }) {
  const resolvedParams = use(params)
  const dniDeLaUrl = resolvedParams.id 

  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      // 1. Cargamos el cliente por su DNI
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('dni', dniDeLaUrl)
        .maybeSingle()

      if (clienteData) {
        setCliente(clienteData)
        
        // 2. Buscamos todos los coches que pertenecen a este cliente
        // Nota: Asegúrate de que en tu tabla 'vehiculos' la columna se llame 'nombre_cliente'
        const { data: coches } = await supabase
          .from('vehiculos')
          .select('*')
          .eq('nombre_cliente', clienteData.nombre)

        setVehiculos(coches || [])
      }
      setCargando(false)
    }

    if (dniDeLaUrl) cargarDatos()
  }, [dniDeLaUrl])

  if (cargando) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white font-black animate-pulse uppercase tracking-widest">Cargando información...</p>
    </div>
  )

  if (!cliente) return <p className="p-10 text-center uppercase font-bold text-red-500">Cliente no encontrado</p>

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Link href="/clientes" className="text-blue-600 font-bold text-xs uppercase italic hover:underline">
          ← Volver al listado
        </Link>

        <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter mt-4 mb-8">
          {cliente.nombre}
        </h1>

        {/* ESTRUCTURA EN COLUMNAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* COLUMNA 1: CONTACTO Y DEUDA */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] mb-4 italic">Información de Contacto</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">DNI / NIE</p>
                  <p className="font-bold text-gray-700">{cliente.dni}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Teléfono</p>
                  <p className="font-bold text-gray-700">{cliente.telefono}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Email</p>
                  <p className="font-bold text-gray-700 text-sm">{cliente.email || 'No disponible'}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Deuda Pendiente</p>
              <p className="text-4xl font-black text-red-600">{cliente.saldo_pendiente || 0}€</p>
              <button 
                onClick={() => {
                    const msg = `Hola ${cliente.nombre}, te escribo de Autos Victoria para recordarte tu saldo pendiente de ${cliente.saldo_pendiente}€. Un saludo.`
                    window.open(`https://wa.me/${cliente.telefono.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
                }}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-2xl shadow-lg transition-all uppercase text-[10px] tracking-widest"
              >
                💬 Enviar Recordatorio
              </button>
            </div>
          </div>

          {/* COLUMNA 2 Y 3: LISTADO DE VEHÍCULOS */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] mb-6 italic">Vehículos y Fotos</h2>
              
              {vehiculos.length === 0 ? (
                <p className="text-gray-400 text-sm italic py-10 text-center uppercase font-bold border-2 border-dashed rounded-2xl">Este cliente no tiene vehículos registrados</p>
              ) : (
                <div className="space-y-6">
                  {vehiculos.map((v) => (
                    <div key={v.id} className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-300 transition-all">
                      {/* Foto del vehículo */}
                      <div className="w-full md:w-48 h-32 bg-gray-200 rounded-xl overflow-hidden relative shadow-inner">
                        {v.foto_url ? (
                          <img 
                            src={v.foto_url} 
                            alt={v.marca_modelo} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-[10px] font-bold uppercase">Sin Foto</div>
                        )}
                      </div>

                      {/* Datos del vehículo */}
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-gray-800 uppercase text-lg">{v.marca_modelo}</h3>
                          <span className="bg-blue-900 text-white text-[10px] px-3 py-1 rounded-full font-bold">{v.matricula}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Entrada</p>
                            <p className="text-xs font-bold text-gray-600">{v.fecha_entrada || '--/--/--'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Estado</p>
                            <p className="text-xs font-bold text-blue-600 uppercase italic">En Custodia</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}