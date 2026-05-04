'use client'
import { useState } from 'react'
import { supabase } from '../../supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NuevoVehiculo() {
  const [form, setForm] = useState({ matricula: '', marca_modelo: '', km: '', nombre_cliente: '' })
  const [imagen, setImagen] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const router = useRouter()

  const handleSubir = async (e) => {
    e.preventDefault()
    setSubiendo(true)

    try {
      let fotoUrl = ''

      // 1. Subir la imagen al Storage de Supabase
      if (imagen) {
        const fileExt = imagen.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage
          .from('fotos_vehiculos') // Asegúrate de haber creado este Bucket como "Public"
          .upload(fileName, imagen)

        if (uploadError) throw uploadError
        
        // Obtener el enlace público de la foto
        const { data: { publicUrl } } = supabase.storage
          .from('fotos_vehiculos')
          .getPublicUrl(fileName)
        
        fotoUrl = publicUrl
      }

      // 2. Guardar todos los datos en la tabla vehiculos
      const { error } = await supabase
        .from('vehiculos')
        .insert([{ 
          ...form, 
          foto_url: fotoUrl, 
          fecha_inicio: new Date().toISOString().split('T')[0] 
        }])

      if (error) throw error
      
      alert("✅ Vehículo guardado correctamente")
      router.push('/inventario')
    } catch (err) {
      alert("Error al guardar: " + err.message)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <Link href="/" className="text-blue-600 text-xs font-bold mb-4 inline-block hover:underline">
          ← VOLVER AL MENÚ
        </Link>
        
        <h1 className="text-2xl font-bold text-blue-900 mb-6 uppercase tracking-tight">Nuevo Registro</h1>
        
        <form onSubmit={handleSubir} className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Matrícula</label>
            <input type="text" className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-blue-500 outline-none" required
              onChange={e => setForm({...form, matricula: e.target.value.toUpperCase()})} />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Marca y Modelo</label>
            <input type="text" className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-blue-500 outline-none" required
              onChange={e => setForm({...form, marca_modelo: e.target.value})} />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Kilómetros actuales</label>
            <input type="number" className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-blue-500 outline-none" required
              onChange={e => setForm({...form, km: e.target.value})} />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Cliente</label>
            <input type="text" className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-blue-500 outline-none" required
              onChange={e => setForm({...form, nombre_cliente: e.target.value})} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Foto del estado</label>
            <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              onChange={e => setImagen(e.target.files[0])} />
          </div>

          <button type="submit" disabled={subiendo} className="bg-blue-900 text-white p-4 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg">
            {subiendo ? 'SUBIENDO DATOS...' : 'GUARDAR VEHÍCULO'}
          </button>
        </form>
      </div>
    </div>
  )
}