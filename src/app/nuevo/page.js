'use client'
// ... (tus otros imports: useState, supabase, etc.)

return (
  <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
      
      <Link href="/" className="text-blue-600 font-bold text-xs uppercase mb-4 inline-block hover:underline">
        ← Volver al Inicio
      </Link>

      <h1 className="text-2xl font-black text-gray-800 uppercase mb-6 text-center tracking-tighter">
        Registrar Nuevo Vehículo
      </h1>

      <form className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Matrícula</label>
          <input 
            type="text" 
            placeholder="Ej: 1234ABC"
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none transition-all placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Marca y Modelo</label>
          <input 
            type="text" 
            placeholder="Ej: Fiat 500"
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none transition-all placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Kilómetros</label>
          <input 
            type="number" 
            placeholder="Ej: 45000"
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-900 outline-none transition-all placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Foto del Vehículo</label>
          <input 
            type="file" 
            className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button 
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-black py-4 rounded-xl shadow-lg mt-4 transition-all uppercase tracking-widest active:scale-95"
        >
          Registrar Vehículo
        </button>
      </form>
    </div>
  </div>
)