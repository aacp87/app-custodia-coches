'use client'
import { useState } from 'react'
import { supabase } from '../../../supabase' // Ruta para subir 3 niveles
import Link from 'next/link'

export default function NuevoCliente() {
  const [cargando, setCargando] = useState(false)
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', dni: '' })

  const guardarCliente = async (e) => {
    e.preventDefault()
    setCargando(true)

    const { error } = await supabase.from('clientes').insert([
      { 
        nombre: form.nombre, 
        telefono: form.telefono, 
        email: form.email, 
        dni: form.dni,
        saldo_pendiente: 0 // Empezamos de cero
      }
    ])

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("✅ Cliente registrado correctamente")
      window.location.href = '/clientes'
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <Link href="/clientes" className="text-blue-600 font-bold text-xs uppercase mb-4 inline-block tracking-widest italic">
          ← Volver a Clientes
        </Link>

        <h1 className="text-2xl font-black text-gray-800 uppercase mb-6 text-center tracking-tighter">
          Nuevo Cliente
        </h1>

        <form onSubmit={guardarCliente} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Nombre Completo</label>
            <input 
              type="text" required
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none"
              onChange={(e) => setForm({...form, nombre: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">DNI / NIE</label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none"
                onChange={(e) => setForm({...form, dni: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Teléfono</label>
              <input 
                type="tel" required
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none"
                onChange={(e) => setForm({...form, telefono: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Email</label>
            <input 
              type="email"
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none"
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>

          <button 
            type="submit" disabled={cargando}
            className="w-full bg-blue-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg mt-4 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {cargando ? 'Guardando...' : 'Registrar Cliente'}
          </button>
        </form>
      </div>
    </div>
  )
}