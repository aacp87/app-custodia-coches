'use client'
import Link from 'next/link'

export default function Inicio() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      
      <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter mb-2">
        Gestión de Flota
      </h1>
      <p className="text-gray-400 font-medium mb-10 text-sm uppercase tracking-widest">
        Selecciona el apartado al que quieres acceder:
      </p>

      {/* REJILLA DE BOTONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        
        {/* BOTÓN DIARIO */}
        <Link href="/diario" className="group">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl hover:border-blue-500 transition-all duration-300">
            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">📅</span>
            <h2 className="text-xl font-black text-gray-800 uppercase">Diario</h2>
            <p className="text-gray-400 text-xs mt-2 text-center">Control de entregas y recogidas del día.</p>
          </div>
        </Link>

        {/* BOTÓN INVENTARIO */}
        <Link href="/inventario" className="group">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl hover:border-blue-500 transition-all duration-300">
            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🚗</span>
            <h2 className="text-xl font-black text-gray-800 uppercase">Inventario</h2>
            <p className="text-gray-400 text-xs mt-2 text-center">Listado completo de vehículos y flota.</p>
          </div>
        </Link>

        {/* BOTÓN CLIENTES (NUEVO) */}
        <Link href="/clientes" className="group">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl hover:border-blue-500 transition-all duration-300">
            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">👤</span>
            <h2 className="text-xl font-black text-gray-800 uppercase">Clientes</h2>
            <p className="text-gray-400 text-xs mt-2 text-center">Cartera de clientes, deudas y fichas personales.</p>
          </div>
        </Link>

        {/* BOTÓN NUEVO VEHÍCULO (NUEVO) */}
        <Link href="/nuevo" className="group">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl hover:border-blue-500 transition-all duration-300">
            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">➕</span>
            <h2 className="text-xl font-black text-gray-800 uppercase">Nuevo Coche</h2>
            <p className="text-gray-400 text-xs mt-2 text-center">Registrar un nuevo vehículo en el sistema.</p>
          </div>
        </Link>

      </div>

      <button className="mt-12 text-gray-300 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-red-500 transition-colors">
        Cerrar Sesión
      </button>

    </div>
  )
}