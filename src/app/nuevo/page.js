'use client' // Esto soluciona el error rojo de Vercel
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Link from 'next/link'

export default function NuevoVehiculo() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(false)
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    matricula: '',
    marca_modelo: '',
    km: '',
    cliente_id: ''
  })

  // Cargar la lista de clientes para el desplegable
  useEffect(() => {
    const obtenerClientes = async () => {
      const { data } = await supabase.from('clientes').select('id, nombre').order('nombre')
      setClientes(data || [])
    }
    obtenerClientes()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    // Aquí iría tu lógica de guardado que ya tienes
    alert('Guardando vehículo...')
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        
        <Link href="/" className="text-blue-600 font-bold text-xs uppercase mb-4 inline-block hover:underline">
          ← Volver al Inicio
        </Link>

        <h1 className="text-2xl font-black text-gray-800 uppercase mb-6 text-center tracking-tighter">
          Nuevo Vehículo
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* MATRÍCULA */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Matrícula</label>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none transition-all"
              placeholder="0000BBB"
              onChange={(e) => setFormData({...formData, matricula: e.target.value})}
            />
          </div>

          {/* MARCA Y MODELO */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Marca y Modelo</label>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none transition-all"
              placeholder="Fiat 500"
              onChange={(e) => setFormData({...formData, marca_modelo: e.target.value})}
            />
          </div>

          {/* DESPLEGABLE DE CLIENTES */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Dueño / Cliente</label>
            <select 
              required
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none transition-all appearance-none cursor-pointer"
              onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
            >
              <option value="">Selecciona un cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* FOTO */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Foto del coche</label>
            <input 
              type="file" 
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button 
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-black py-4 rounded-xl shadow-lg mt-4 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {cargando ? 'Registrando...' : 'Registrar Vehículo'}
          </button>
        </form>
      </div>
    </div>
  )
}