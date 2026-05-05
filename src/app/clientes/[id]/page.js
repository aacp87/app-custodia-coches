'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../supabase' 
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react' 

export default function FichaCliente({ params }) {
  const resolvedParams = use(params)
  const dniDeLaUrl = resolvedParams.id 

  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargarDatos = async () => {
    const { data: clienteData } = await supabase.from('clientes').select('*').eq('dni', dniDeLaUrl).maybeSingle()
    if (clienteData) {
      setCliente(clienteData)
      
      const { data: coches } = await supabase.from('vehiculos').select('*').eq('nombre_cliente', clienteData.nombre)
      setVehiculos(coches || [])
      
      const { data: factu } = await supabase.from('facturas').select('*').eq('dni_cliente', clienteData.dni).order('fecha', { ascending: false })
      setFacturas(factu || [])
    }
    setCargando(false)
  }

  useEffect(() => { if (dniDeLaUrl) cargarDatos() }, [dniDeLaUrl])

  // --- NUEVAS FUNCIONES PARA BORRAR ---
  const borrarVehiculo = async (id, matricula) => {
    if (confirm(`¿Seguro que quieres borrar el vehículo con matrícula ${matricula}?`)) {
      await supabase.from('vehiculos').delete().eq('id', id)
      cargarDatos() // Recargamos para que desaparezca
    }
  }

  const borrarFactura = async (id, concepto) => {
    if (confirm(`¿Seguro que quieres borrar la factura o visita "${concepto}"?`)) {
      await supabase.from('facturas').delete().eq('id', id)
      cargarDatos() // Recargamos para que desaparezca
    }
  }

  if (cargando) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-white font-black animate-pulse uppercase tracking-widest">Cargando Expediente...</p></div>
  if (!cliente) return <p className="p-10 text-center uppercase font-bold text-red-500">Cliente no encontrado</p>

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3 no-print">
               <Link href="/">
                 <span className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-300 transition-all cursor-pointer">
                   🏠 Inicio
                 </span>
               </Link>
               <Link href="/clientes">
                 <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 transition-all cursor-pointer">
                   ← Lista de Clientes
                 </span>
               </Link>
            </div>
            <h1 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">{cliente.nombre}</h1>
          </div>
          
          <div className="flex gap-3 no-print">
             <Link href={`/nuevo?cliente=${cliente.nombre}`}>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">
                  + Añadir Vehículo
                </button>
             </Link>
             <Link href={`/factura-nueva?cliente=${cliente.nombre}&dni=${cliente.dni}`}>
                <button className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all">
                  + Crear Factura / Visita
                </button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA 1: CONTACTO Y QR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 italic underline">Ficha de Contacto</h2>
              <div className="space-y-2 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">DNI: <span className="text-gray-800 font-black">{cliente.dni}</span></p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Teléfono: <span className="text-gray-800 font-black">{cliente.telefono}</span></p>
              </div>

              <div className="border-t pt-6 flex flex-col items-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Código QR del Vehículo</p>
                <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-inner">
                  <QRCodeSVG value={`https://avmenorca.com/clientes/${cliente.dni}`} size={120} level={"H"} includeMargin={true} />
                </div>
                <p className="text-[10px] font-black text-blue-600 mt-4 uppercase">Escanear para abrir ficha</p>
                <button onClick={() => window.print()} className="mt-4 text-[9px] font-bold text-gray-300 hover:text-gray-500 uppercase underline no-print">Imprimir etiqueta</button>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: COCHES Y FACTURAS */}
          <div className="lg:col-span-8 space-y-6 no-print">
            
            {/* SECCIÓN COCHES */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Vehículos en Custodia</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehiculos.length === 0 ? (
                  <p className="text-sm font-bold text-gray-300 italic">No hay vehículos registrados.</p>
                ) : (
                  vehiculos.map(v => (
                    <div key={v.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center group">
                      <div>
                        <p className="font-black text-gray-800 uppercase">{v.marca_modelo}</p>
                        <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-3 py-1 rounded-full uppercase inline-block mt-1">{v.matricula}</span>
                      </div>
                      {/* BOTÓN BORRAR VEHÍCULO */}
                      <button 
                        onClick={() => borrarVehiculo(v.id, v.matricula)} 
                        className="text-gray-300 hover:text-red-600 font-black text-lg px-2 transition-colors" 
                        title="Borrar vehículo"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECCIÓN FACTURAS */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Historial de Visitas y Facturación</h2>
              <div className="space-y-4">
                {facturas.length === 0 ? (
                  <p className="text-sm font-bold text-gray-300 italic">No hay visitas registradas aún.</p>
                ) : (
                  facturas.map((f, index) => (
                    <div key={f.id} className="flex items-stretch gap-2">
                      <Link href={`/factura-editar/${f.id}`} className="block flex-1 group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-2xl group-hover:bg-blue-50 group-hover:border-blue-200 transition-all h-full">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                              #{facturas.length - index}
                            </div>
                            <div>
                              <p className="font-black text-gray-800 uppercase text-sm">{f.concepto}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fecha de visita: {f.fecha}</p>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex items-center gap-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${f.pagado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                              {f.pagado ? 'Pagado' : 'Pendiente'}
                            </span>
                            <p className="font-black text-gray-800 text-lg">{f.monto}€</p>
                          </div>
                        </div>
                      </Link>

                      {/* BOTÓN BORRAR FACTURA */}
                      <button 
                        onClick={() => borrarFactura(f.id, f.concepto)} 
                        className="bg-white border border-gray-100 hover:bg-red-50 hover:border-red-200 text-gray-300 hover:text-red-500 px-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center"
                        title="Borrar factura"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .max-w-7xl { margin: 0; padding: 0; }
        }
      `}</style>
    </div>
  )
}