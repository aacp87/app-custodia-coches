'use client' 
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase' // RUTA CORREGIDA PARA VERCEL
import Link from 'next/link'

export default function NuevoVehiculo() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [foto, setFoto] = useState(null)
  
  const [formData, setFormData] = useState({
    matricula: '',
    marca_modelo: '',
    cliente_id: ''
  })

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

    try {
      let fotoUrl = ''

      // 1. Subir foto si existe
      if (foto) {
        const fileExt = foto.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data: uploadData } = await supabase.storage
          .from('vehiculos')
          .upload(fileName, foto)
        
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('vehiculos').getPublicUrl(fileName)
          fotoUrl = urlData.publicUrl
        }
      }

      // 2. Buscar el nombre del cliente para guardarlo también (opcional pero ayuda)
      const clienteSeleccionado = clientes.find(c => c.id === formData.cliente_id)

      // 3. Insertar en la tabla vehiculos
      const { error } = await supabase.from('vehiculos').insert([{
        matricula: formData.matricula.toUpperCase(),
        marca_modelo: formData.marca_modelo.toUpperCase(),
        cliente_id: formData.cliente_id,
        nombre_cliente: clienteSeleccionado?.nombre,
        foto_url: fotoUrl,
        estado: 'En nave'
      }])

      if (error) throw error
      
      alert('✅ Vehículo registrado con éxito')
      window.location.href = '/inventario'

    } catch (err) {
      alert('Error al guardar: ' + err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        
        <Link href="/" className="text-blue-600 font-bold text-xs uppercase mb-4 inline-block hover:underline">
          ← Inicio
        </Link>

        <h1 className="text-2xl font-black text-gray-800 uppercase mb-6 text-center tracking-tighter">
          Nuevo Vehículo
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Matrícula</label>
            <input 
              type="text" 
              required
              placeholder="0000BBB"
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none transition-all"
              onChange={(e) => setFormData({...formData, matricula: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Marca y Modelo</label>
            <input 
              type="text" 
              required
              placeholder="FIAT 500"
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none transition-all"
              onChange={(e) => setFormData({...formData, marca_modelo: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Dueño / Cliente</label>
            <select 
              required
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none appearance-none cursor-pointer"
              onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
            >
              <option value="">Selecciona un cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Foto del coche</label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setFoto(e.target.files[0])}
            />
          </div>

          <button 
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-black py-4 rounded-xl shadow-lg mt-4 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {cargando ? 'Guardando...' : 'Registrar Vehículo'}
          </button>
        </form>
      </div>
    </div>
  )
}