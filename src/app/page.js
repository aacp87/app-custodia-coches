'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  // 1. ESTADOS PARA LOS DATOS DEL VEHÍCULO
  const [matricula, setMatricula] = useState('')
  const [nombreCliente, setNombreCliente] = useState('')
  const [marcaModelo, setMarcaModelo] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaRecogida, setFechaRecogida] = useState('')
  const [mensaje, setMensaje] = useState('')

  // 2. ESTADOS PARA LA SESIÓN Y SEGURIDAD
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Comprobamos si el empleado ha iniciado sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login') // Si no hay sesión, lo mandamos al login
      } else {
        setSession(session)
      }
      setLoading(false)
    })
  }, [router])

  // 3. FUNCIÓN PARA CERRAR SESIÓN
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // 4. FUNCIÓN PARA GUARDAR EN LA BASE DE DATOS
  const guardarVehiculo = async (e) => {
    e.preventDefault()
    setMensaje('Guardando en diario...')

    const { error } = await supabase.from('vehiculos').insert([{
      matricula,
      nombre_cliente: nombreCliente,
      marca_modelo: marcaModelo,
      lugar: 'Aeropuerto',
      fecha_inicio: fechaInicio,
      fecha_recogida: fechaRecogida,
      registrado_por: session?.user?.email // Guardamos quién lo hizo
    }])

    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      setMensaje('¡Reserva guardada con éxito!')
      // Limpiamos el formulario
      setMatricula(''); setNombreCliente(''); setMarcaModelo('')
      setTimeout(() => router.push('/diario'), 1500)
    }
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando sistema...</p>
  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-100 p-4" style={{ position: 'relative' }}>
      
      {/* BOTÓN DE CERRAR SESIÓN */}
      <button 
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 1000
        }}
      >
        CERRAR SESIÓN
      </button>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600 mt-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">NUEVA RESERVA AEROPUERTO</h2>
        
        <form onSubmit={guardarVehiculo} className="space-y-4">
          <input 
            className="w-full p-3 border rounded-lg"
            placeholder="NOMBRE Y APELLIDO CLIENTE"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            required
          />
          
          <div className="flex gap-2">
            <input 
              className="w-1/2 p-3 border rounded-lg font-bold text-blue-600"
              placeholder="MATRÍCULA"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.toUpperCase())}
              required
            />
            <input 
              className="w-1/2 p-3 border rounded-lg"
              placeholder="MARCA/MODELO"
              value={marcaModelo}
              onChange={(e) => setMarcaModelo(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">DÍA ENTREGA (INICIO)</label>
            <input 
              type="datetime-local"
              className="w-full p-3 border rounded-lg bg-gray-50"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">DÍA RECOGIDA (FIN)</label>
            <input 
              type="datetime-local"
              className="w-full p-3 border rounded-lg bg-blue-50"
              value={fechaRecogida}
              onChange={(e) => setFechaRecogida(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors"
          >
            CONFIRMAR AEROPUERTO
          </button>
        </form>

        {mensaje && (
          <p className="mt-4 text-center font-bold text-blue-600 animate-pulse">
            {mensaje}
          </p>
        )}
      </div>
    </div>
  )
}