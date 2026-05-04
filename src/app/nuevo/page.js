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
      if (imagen) {
        const fileExt = imagen.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage
          .from('fotos_vehiculos')
          .upload(fileName, imagen)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage
          .from('fotos_vehiculos')
          .getPublicUrl(fileName)
        fotoUrl = publicUrl
      }

      const { error } = await supabase
        .from('vehiculos')
        .insert([{ 
          ...form, 
          foto_url: fotoUrl, 
          fecha_inicio: new Date().toISOString().split('T')[0] 
        }])

      if (error) throw error
      alert("✅ Guardado")
      router.push('/inventario')
    } catch (err) {
      alert("Error: " + err.message)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <Link href="/" className="text-blue-600 font-bold text-sm">← VOLVER</Link>
      <form onSubmit={handleSubir} className="max-w-md mx-auto mt-10 flex flex-col gap-4">
        <h1 className="text-2xl font-bold uppercase">Nuevo Vehículo</h1>
        <input type="text" placeholder="Matrícula" className="border p-3 rounded" required
          onChange={e => setForm({...form, matricula: e.target.value.toUpperCase()})} />
        <input type="text" placeholder="Marca y Modelo" className="border p-3 rounded" required
          onChange={e => setForm({...form, marca_modelo: e.target.value})} />
        <input type="number" placeholder="KM" className="border p-3 rounded" required
          onChange={e => setForm({...form, km: e.target.value})} />
        <input type="text" placeholder="Cliente" className="border p-3 rounded" required
          onChange={e => setForm({...form, nombre_cliente: e.target.value})} />
        <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} />
        <button className="bg-blue-900 text-white p-4 rounded font-bold">
          {subiendo ? 'GUARDANDO...' : 'REGISTRAR'}
        </button>
      </form>
    </div>
  )
}