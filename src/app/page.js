'use client'
import { useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [matricula, setMatricula] = useState('')
  const [nombreCliente, setNombreCliente] = useState('')
  const [marcaModelo, setMarcaModelo] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaRecogida, setFechaRecogida] = useState('')
  const [mensaje, setMensaje] = useState('')

  const guardarVehiculo = async (e) => {
    e.preventDefault()
    setMensaje('Guardando en diario...')
    
    const { error } = await supabase.from('vehiculos').insert([{ 
      matricula, 
      nombre_cliente: nombreCliente,
      marca_modelo: marcaModelo, 
      lugar: 'Aeropuerto',
      fecha_inicio: fechaInicio,
      fecha_recogida: fechaRecogida 
    }])

    if (error) { 
      setMensaje('Error: ' + error.message) 
    } else {
      setMensaje('¡Reserva guardada con éxito!')
      setTimeout(() => router.push('/diario'), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
        <h1 className="text-xl font-bold mb-6 text-gray-800 uppercase">Nueva Reserva Aeropuerto</h1>
        <form onSubmit={guardarVehiculo} className="space-y-4">
          <input type="text" placeholder="NOMBRE Y APELLIDO CLIENTE" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} required className="w-full p-2 border rounded" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="MATRÍCULA" value={matricula} onChange={(e) => setMatricula(e.target.value.toUpperCase())} required className="p-2 border rounded font-bold text-blue-600" />
            <input type="text" placeholder="MARCA/MODELO" value={marcaModelo} onChange={(e) => setMarcaModelo(e.target.value)} required className="p-2 border rounded" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Día Entrega (Inicio)</label>
            <input type="datetime-local" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Día Recogida (Fin)</label>
            <input type="datetime-local" value={fechaRecogida} onChange={(e) => setFechaRecogida(e.target.value)} required className="w-full p-2 border rounded bg-blue-50 border-blue-200" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold uppercase shadow-md hover:bg-blue-700">Confirmar Aeropuerto</button>
        </form>
        {mensaje && <p className={`mt-4 text-center font-bold ${mensaje.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{mensaje}</p>}
      </div>
    </div>
  )
}