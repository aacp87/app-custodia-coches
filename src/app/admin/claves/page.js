'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../supabase'
import Link from 'next/link'

export default function AdminClaves() {
  const [autorizado, setAutorizado] = useState(false)
  const [pin, setPin] = useState('')
  const [credenciales, setCredenciales] = useState([])
  const [verPass, setVerPass] = useState({}) // Para ocultar/mostrar passwords individualmente

  const PIN_MAESTRO = "1987" // CAMBIA ESTO POR TU PIN SECRETO

  const comprobarPin = () => {
    if (pin === PIN_MAESTRO) {
      setAutorizado(true)
      cargarCredenciales()
    } else {
      alert("PIN Incorrecto")
    }
  }

  const cargarCredenciales = async () => {
    const { data } = await supabase.from('seguridad_empleados').select('*').order('empleado')
    setCredenciales(data || [])
  }

  const togglePass = (id) => {
    setVerPass(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 shadow-2xl w-full max-w-md text-center">
          <h2 className="text-white font-black uppercase tracking-widest mb-6">Acceso Restringido</h2>
          <input 
            type="password" 
            placeholder="INTRODUCE PIN" 
            className="w-full bg-black border border-gray-700 p-4 rounded-2xl text-center text-white font-black text-2xl tracking-[1em] mb-4"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button onClick={comprobarPin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
            Entrar al Panel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter">🔐 Gestión de Claves</h1>
          <Link href="/"><span className="text-[10px] font-black uppercase bg-gray-200 px-4 py-2 rounded-xl cursor-pointer">Cerrar sesión</span></Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {credenciales.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{c.servicio}</span>
                <p className="font-black text-gray-800 text-lg uppercase leading-none mt-1">{c.empleado}</p>
              </div>
              
              <div className="flex-1 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-full md:w-auto">
                <p className="text-[9px] font-black text-gray-400 uppercase">Usuario</p>
                <p className="font-bold text-gray-700 break-all">{c.usuario}</p>
              </div>

              <div className="flex-1 bg-gray-900 px-4 py-2 rounded-xl w-full md:w-auto flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase">Contraseña</p>
                  <p className="font-mono text-blue-400 font-bold">
                    {verPass[c.id] ? c.password : '••••••••'}
                  </p>
                </div>
                <button onClick={() => togglePass(c.id)} className="text-lg">{verPass[c.id] ? '👁️‍🗨️' : '👁️'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}