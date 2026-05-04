'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <h1 className="text-3xl font-extrabold text-blue-900 mb-2 uppercase tracking-tighter">
        Gestión de Flota
      </h1>
      <p className="text-gray-500 mb-10 font-medium">Selecciona el apartado al que quieres acceder:</p>

      {/* DISEÑO DE 3 COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        
        {/* BOTÓN DIARIO */}
        <Link href="/diario" className="group">
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent group-hover:border-blue-600 transition-all transform group-hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer h-full">
            <span className="text-4xl mb-4">📅</span>
            <h2 className="text-xl font-bold text-gray-800 uppercase">Diario</h2>
            <p className="text-sm text-gray-500 mt-2">Entregas y recogidas del día.</p>
          </div>
        </Link>

        {/* BOTÓN NUEVO REGISTRO (LA TARJETA NUEVA) */}
        <Link href="/nuevo" className="group">
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent group-hover:border-green-600 transition-all transform group-hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer h-full">
            <span className="text-4xl mb-4">➕</span>
            <h2 className="text-xl font-bold text-gray-800 uppercase">Nuevo</h2>
            <p className="text-sm text-gray-500 mt-2">Registrar entrada de vehículo y fotos.</p>
          </div>
        </Link>

        {/* BOTÓN INVENTARIO */}
        <Link href="/inventario" className="group">
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent group-hover:border-blue-900 transition-all transform group-hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer h-full">
            <span className="text-4xl mb-4">🚗</span>
            <h2 className="text-xl font-bold text-gray-800 uppercase">Inventario</h2>
            <p className="text-sm text-gray-500 mt-2">Listado completo de la flota.</p>
          </div>
        </Link>

      </div>

      <div className="mt-12">
        <Link href="/login" className="text-gray-400 hover:text-red-500 text-sm font-bold uppercase tracking-widest transition-colors">
          Cerrar Sesión
        </Link>
      </div>
    </div>
  )
}