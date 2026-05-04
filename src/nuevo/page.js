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

      // 1. Subir la imagen si existe
      if (imagen) {
        const fileExt = imagen.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage
          .from('fotos_vehiculos')
          .upload(fileName, imagen)

        if (uploadError) throw uploadError
        
        // Obtener la URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('fotos_vehiculos')
          .getPublicUrl(fileName)
        
        fotoUrl = publicUrl
      }

      // 2. Guardar datos en la tabla
      const { error } = await supabase
        .from('vehiculos')
        .insert([{ ...form, foto_url: fotoUrl, fecha_inicio: new Date().toISOString().split('T')[0] }])

      if (error) throw error
      
      alert("Vehículo registrado con éxito")
      router.push('/inventario')
    } catch (err) {
      alert("Error: " + err.message)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <Link href="/inventario" className="text-blue-600 text-xs font-bold mb-4 inline-block">← CANCELAR</Link>
        <h1 className="text-2xl font-bold text-blue-900 mb-6 uppercase">Nuevo Vehículo</h1>
        
        <form onSubmit={handleSubir} className="flex flex-col gap-4">
          <input type="text" placeholder="Matrícula" className="border p-2 rounded" required
            onChange={e => setForm({...form, matricula: e.target.value})} />
          
          <input type="text" placeholder="Marca y Modelo" className="border p-2 rounded" required
            onChange={e => setForm({...form, marca_modelo: e.target.value})} />
          
          <input type="number" placeholder="Kilómetros" className="border p-2 rounded" required
            onChange={e => setForm({...form, km: e.target.value})} />
          
          <input type="text" placeholder="Nombre del Cliente" className="border p-2 rounded" required
            onChange={e => setForm({...form, nombre_cliente: e.target.value})} />

          <label className="text-sm font-bold text-gray-600">Foto del vehículo:</label>
          <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} />

          <button type="submit" disabled={subiendo} className="bg-blue-900 text-white p-3 rounded font-bold hover:bg-blue-800">
            {subiendo ? 'GUARDANDO...' : 'REGISTRAR VEHÍCULO'}
          </button>
        </form>
      </div>
    </div>
  )
}