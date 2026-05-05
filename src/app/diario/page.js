'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'

export default function DiarioPage() {
  const [avisos, setAvisos] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargarDiario = async () => {
    // 1. Cargamos el diario
    const { data: diarioData } = await supabase.from('diario').select('*').order('fecha', { ascending: true })
    
    // 2. Cargamos todos los vehículos para cruzar los datos
    const { data: vehiculosData } = await supabase.from('vehiculos').select('*')

    if (diarioData) {
      // Cruzamos los datos: A cada aviso le adjuntamos los coches de ese cliente
      const avisosConCoches = diarioData.map(aviso => {
        const cochesDelCliente = vehiculosData ? vehiculosData.filter(v => v.nombre_cliente === aviso.cliente) : []
        return { ...aviso, coches: cochesDelCliente }
      })
      setAvisos(avisosConCoches)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarDiario()
  }, [])

  const borrarAviso = async (id) => {
    if (confirm("¿Confirmas que ya has gestionado este aviso y quieres borrarlo del diario?")) {
      await supabase.from('diario').delete().eq('id', id)
      cargarDiario()
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 print:p-0 print:border-none print:shadow-none print:bg-transparent">
        
        {/* CABECERA (Se ocultan los botones al imprimir) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 print:border-b-2 print:border-black print:pb-2">
          <div>
            <div className="flex items-center gap-2 mb-4 no-print">
              <Link href="/">
                <span className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-300 transition-all cursor-pointer">
                  🏠 Inicio
                </span>
              </Link>
            </div>
            <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter print:text-xl">Diario de Entregas y Devoluciones</h1>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1 print:text-black">Autos Victoria - Listado de Operaciones</p>
          </div>

          <div className="no-print">
            <button 
              onClick={() => window.print()}
              className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              🖨️ Imprimir Listado
            </button>
          </div>
        </div>

        {/* LISTADO TIPO TABLA */}
        {cargando ? (
          <div className="flex justify-center p-10">
            <p className="font-black text-orange-500 animate-pulse uppercase tracking-widest text-xs">Cargando datos...</p>
          </div>
        ) : avisos.length === 0 ? (
          <div className="text-center p-10">
            <p className="font-black text-gray-300 text-lg uppercase tracking-widest mb-2">El diario está limpio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 print:text-black print:border-black">
                  <th className="py-4 px-2 w-48">Llegada / Entrega</th>
                  <th className="py-4 px-2 w-48">Cliente</th>
                  <th className="py-4 px-2 w-64">Vehículo(s)</th>
                  <th className="py-4 px-2">Notas / Devolución</th>
                  <th className="py-4 px-2 text-right no-print w-32">Estado</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-gray-700">
                {avisos.map((aviso, index) => (
                  <tr key={aviso.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} print:bg-transparent print:border-gray-400`}>
                    
                    {/* FECHA ENTREGA */}
                    <td className="py-4 px-2 align-top text-orange-600 font-black tracking-tight">
                      {aviso.fecha}
                    </td>

                    {/* CLIENTE */}
                    <td className="py-4 px-2 align-top">
                      <Link href={`/clientes/${aviso.dni_cliente}`} className="text-blue-700 uppercase hover:underline text-sm font-black tracking-tighter block mb-1 print:text-black print:no-underline">
                        {aviso.cliente}
                      </Link>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest print:text-gray-600">DNI: {aviso.dni_cliente}</span>
                    </td>

                    {/* VEHÍCULOS (Cruzados de la base de datos) */}
                    <td className="py-4 px-2 align-top">
                      {aviso.coches && aviso.coches.length > 0 ? (
                        <div className="space-y-1">
                          {aviso.coches.map(coche => (
                            <div key={coche.id} className="bg-white border border-gray-200 p-2 rounded flex flex-col print:border-none print:p-0">
                              <span className="font-black uppercase text-gray-800 text-[11px] leading-tight print:text-xs">{coche.marca_modelo}</span>
                              <span className="text-blue-600 font-black text-[10px] tracking-widest print:text-black">{coche.matricula}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 italic text-[10px]">Sin vehículos</span>
                      )}
                    </td>

                    {/* NOTAS Y DEVOLUCIÓN */}
                    <td className="py-4 px-2 align-top">
                      <p className="whitespace-pre-wrap text-gray-600 font-medium text-[11px] print:text-black leading-relaxed">
                        {aviso.notas}
                      </p>
                    </td>

                    {/* BOTÓN COMPLETADO (Oculto al imprimir) */}
                    <td className="py-4 px-2 align-top text-right no-print">
                      <button 
                        onClick={() => borrarAviso(aviso.id)}
                        className="bg-green-50 text-green-600 px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border border-green-200 hover:bg-green-500 hover:text-white transition-all whitespace-nowrap"
                      >
                        ✓ Listo
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ESTILOS PARA LA IMPRESIÓN */}
      <style jsx global>{`
        @media print {
          body { 
            background: white !important; 
            color: black !important;
            -webkit-print-color-adjust: exact; 
          }
          .no-print { display: none !important; }
          /* Quitamos los márgenes de la web para aprovechar el folio */
          .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  )
}