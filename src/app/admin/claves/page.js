'use client'
import { useState } from 'react'
import { supabase } from '../../../supabase'
import Link from 'next/link'

export default function AdminClaves() {
  const [autorizado, setAutorizado] = useState(false)
  const [pin, setPin] = useState('')
  const [credenciales, setCredenciales] = useState([])
  const [verPass, setVerPass] = useState({}) 
  
  // Estados para la edición
  const [editandoId, setEditandoId] = useState(null)
  const [nuevaPass, setNuevaPass] = useState('')

  // Estados para crear nuevo empleado
  const [nuevo, setNuevo] = useState({ empleado: '', usuario: '', password: '', servicio: 'Empleado' })

  const PIN_MAESTRO = "1987" 

  const comprobarPin = async () => {
    if (pin === PIN_MAESTRO) {
      setAutorizado(true)
      await cargarCredenciales()
    } else {
      alert("PIN Incorrecto")
    }
  }

  const cargarCredenciales = async () => {
    const { data, error } = await supabase.from('seguridad_empleados').select('*').order('id')
    if (error) {
      alert("Error cargando datos. Revisa que RLS esté desactivado en Supabase.")
    } else {
      setCredenciales(data || [])
    }
  }

  const togglePass = (id) => {
    setVerPass(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // --- FUNCIÓN PARA CAMBIAR CONTRASEÑA ---
  const guardarContrasena = async (id) => {
    if (!nuevaPass) return alert("La contraseña no puede estar vacía")
    
    const { error } = await supabase
      .from('seguridad_empleados')
      .update({ password: nuevaPass })
      .eq('id', id)
      
    if (!error) {
      alert("✅ Contraseña actualizada")
      setEditandoId(null)
      setNuevaPass('')
      cargarCredenciales()
    } else {
      alert("Error al actualizar: " + error.message)
    }
  }

  // --- FUNCIÓN PARA CREAR EMPLEADO ---
  const crearEmpleado = async () => {
    if (!nuevo.empleado || !nuevo.usuario || !nuevo.password) {
      return alert("Rellena todos los campos del nuevo empleado")
    }
    const { error } = await supabase.from('seguridad_empleados').insert([nuevo])
    if (!error) {
      alert("✅ Empleado creado con éxito")
      setNuevo({ empleado: '', usuario: '', password: '', servicio: 'Empleado' })
      cargarCredenciales()
    }
  }

  // --- FUNCIÓN PARA BORRAR EMPLEADO ---
  const borrarEmpleado = async (id, nombre) => {
    if (confirm(`¿Estás seguro de que quieres borrar el acceso a ${nombre}?`)) {
      await supabase.from('seguridad_empleados').delete().eq('id', id)
      cargarCredenciales()
    }
  }


  if (!autorizado) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 shadow-2xl w-full max-w-md text-center">
          <h2 className="text-white font-black uppercase tracking-widest mb-6">Acceso Maestr@</h2>
          <input 
            type="password" 
            placeholder="INTRODUCE PIN" 
            className="w-full bg-black border border-gray-700 p-4 rounded-2xl text-center text-white font-black text-2xl tracking-[1em] mb-4 outline-none focus:border-blue-500"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && comprobarPin()}
          />
          <button onClick={comprobarPin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
            Desbloquear Panel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">🔐 Gestión de Equipo</h1>
          <Link href="/"><button className="bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-red-100 transition-all">Cerrar sesión maestra</button></Link>
        </div>

        {/* CREAR NUEVO EMPLEADO */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">➕ Dar de alta nuevo acceso</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Nombre Empleado" value={nuevo.empleado} onChange={e => setNuevo({...nuevo, empleado: e.target.value})} className="p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-blue-500" />
            <input type="text" placeholder="Usuario (Email/Nick)" value={nuevo.usuario} onChange={e => setNuevo({...nuevo, usuario: e.target.value})} className="p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-blue-500" />
            <input type="text" placeholder="Contraseña" value={nuevo.password} onChange={e => setNuevo({...nuevo, password: e.target.value})} className="p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-blue-500" />
            <button onClick={crearEmpleado} className="bg-black text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all">Crear Acceso</button>
          </div>
        </div>

        {/* LISTA DE EMPLEADOS */}
        <div className="grid grid-cols-1 gap-4">
          {credenciales.length === 0 && <p className="text-center text-gray-500 font-bold mt-10">No hay empleados registrados o RLS está bloqueando la lectura.</p>}
          
          {credenciales.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              
              <div className="flex-1 w-full text-center md:text-left">
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">{c.servicio || 'Staff'}</span>
                <p className="font-black text-gray-900 text-xl uppercase mt-2">{c.empleado}</p>
              </div>
              
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 w-full text-center md:text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Usuario</p>
                <p className="font-black text-gray-700">{c.usuario}</p>
              </div>

              <div className="flex-1 bg-gray-900 px-4 py-3 rounded-xl w-full">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contraseña</p>
                  <button onClick={() => togglePass(c.id)} className="text-gray-300 hover:text-white transition-all text-sm">{verPass[c.id] ? 'Ocultar 👁️‍🗨️' : 'Ver 👁️'}</button>
                </div>
                
                {/* MODO EDICIÓN DE CONTRASEÑA - ARREGLADO EL COLOR */}
                {editandoId === c.id ? (
                  <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                    <input 
                      type="text" 
                      autoFocus 
                      value={nuevaPass} 
                      onChange={(e) => setNuevaPass(e.target.value)} 
                      // HE AÑADIDO: bg-white text-gray-900
                      className="w-full p-2 rounded-lg text-sm font-black bg-white text-gray-900 outline-none border-2 border-blue-500 shadow-inner" 
                      placeholder="Nueva clave..." 
                    />
                    <button onClick={() => guardarContrasena(c.id)} className="bg-green-500 text-white px-3 rounded-lg font-black text-xs hover:bg-green-600 transition-all">✓</button>
                    <button onClick={() => setEditandoId(null)} className="bg-red-500 text-white px-3 rounded-lg font-black text-xs hover:bg-red-600 transition-all">✕</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="font-mono text-blue-400 font-bold text-lg">
                      {verPass[c.id] ? c.password : '••••••••'}
                    </p>
                    <button onClick={() => { setEditandoId(c.id); setNuevaPass(c.password); }} className="text-[10px] font-black text-gray-800 bg-gray-200 px-2 py-1 rounded hover:bg-white uppercase tracking-widest transition-all">Editar</button>
                  </div>
                )}
              </div>

              {/* BOTÓN BORRAR */}
              <div className="flex-none text-right">
                <button onClick={() => borrarEmpleado(c.id, c.empleado)} className="text-red-300 hover:text-red-500 text-xl transition-all p-2 rounded-lg hover:bg-red-50" title="Eliminar empleado">🗑️</button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}