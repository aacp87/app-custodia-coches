'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Link from 'next/link'

function FormularioVehiculo() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Leemos el nombre del cliente si viene por la URL
  const clientePreseleccionado = searchParams.get('cliente')

  const [clientes, setClientes] = useState([])
  const [nombreCliente, setNombreCliente] = useState(clientePreseleccionado || '')
  const [marcaModelo, setMarcaModelo] = useState('')
  const [matricula, setMatricula] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    const cargarClientes = async () => {
      const { data } = await supabase.from('clientes').select('nombre').order('nombre')
      setClientes(data || [])
    }
    cargarClientes()
  }, [])

  const guardarVehiculo = async (e) => {
    e.preventDefault()
    setSubiendo(true)

    const { error } = await supabase.from('vehiculos').insert([
      { 
        nombre_cliente: nombreCliente, 
        marca_modelo: marcaModelo, 
        matricula: matricula.toUpperCase(), 
        foto_url: fotoUrl,
        fecha_entrada: new Date().toLocaleDateString()
      }
    ])

    if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      alert("✅ Vehículo registrado correctamente")
      router.back() // Nos devuelve a la ficha del cliente automáticamente
    }
    setSubiendo(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-black text-blue-900 uppercase mb-6 tracking-tighter">Nuevo Vehículo</h1>
        
        <form onSubmit={guardarVehiculo} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Dueño / Cliente</label>
            <select 
              value={nombreCliente} 
              onChange={(e) => setNombreCliente(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 outline-blue-500"
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map(c => (
                <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Marca y Modelo</label>
            <input 
              type="text" 
              placeholder="Ej: Fiat 500 Blanco" 
              value={marcaModelo}
              onChange={(e) => setMarcaModelo(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Matrícula</label>
            <input 
              type="text" 
              placeholder="0000 AAA" 
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">URL de la Foto</label>
            <input 
              type="text" 
              placeholder="Pega el link de la imagen" 
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={subiendo}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest text-xs hover:bg-blue-700 transition-all disabled:bg-gray-300"
          >
            {subiendo ? 'Guardando...' : 'Registrar Vehículo'}
          </button>
        </form>

        <button onClick={() => router.back()} className="w-full mt-4 text-[10px] font-bold text-gray-400 uppercase hover:text-red-500 italic">
          Cancelar
        </button>
      </div>
    </div>
  )
}

// Next.js requiere Suspense para usar useSearchParams en componentes de cliente
export default function NuevoVehiculo() {
  return (
    <Suspense fallback={<p className="text-center p-10 font-black uppercase">Cargando formulario...</p>}>
      <FormularioVehiculo />
    </Suspense>
  )
}