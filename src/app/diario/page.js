'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'

export default function DiarioPage() {
  const [avisos, setAvisos] = useState([])
  const [cargando, setCargando] = useState(true)

  // ESTADOS PARA LOS FILTROS
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos') // 'todos', 'entregas', 'devoluciones'

  const cargarDiario = async () => {
    const { data: diarioData } = await supabase.from('diario').select('*').order('fecha', { ascending: true })
    const { data: vehiculosData } = await supabase.from('vehiculos').select('*')

    if (diarioData) {
      const avisosConCoches = diarioData.map(aviso => {
        const cochesDelCliente = vehiculosData ? vehiculosData.filter(v => v.nombre_cliente === aviso.cliente) : []
        return { ...aviso, coches: cochesDelCliente }
      })
      setAvisos(avisosConCoches)
    }
    setCargando(false)
  }

  useEffect(() => { cargarDiario() }, [])

  const borrarAviso = async (id) => {
    if (confirm("¿Confirmas que ya has gestionado este aviso y quieres borrarlo del diario?")) {
      await supabase.from('diario').delete().eq('id', id)
      cargarDiario()
    }
  }

  // --- LÓGICA INTELIGENTE DE FILTRADO ---
  // Extraemos la fecha de entrega (ej: "2026-05-06")
  const getFEntrega = (aviso) => aviso.fecha.split(' ')[0]
  // Buscamos en el texto la fecha de devolución
  const getFDevolucion = (aviso) => {
    const match = aviso.notas.match(/SE DEVUELVE EL: (\d{4}-\d{2}-\d{2})/)
    return match ? match[1] : null
  }

  // 1. Filtramos primero por FECHAS
  const avisosEnRangoFechas = avisos.map(aviso => {
    const fe = getFEntrega(aviso)
    const fd = getFDevolucion(aviso)
    
    let esEntregaValida = true
    let esDevolucionValida = true

    if (fechaDesde) {
      if (fe < fechaDesde) esEntregaValida = false
      if (!fd || fd < fechaDesde) esDevolucionValida = false
    }
    if (fechaHasta) {
      if (fe > fechaHasta) esEntregaValida = false
      if (!fd || fd > fechaHasta) esDevolucionValida = false
    }
    
    return { ...aviso, esEntregaValida, esDevolucionValida }
  }).filter(a => a.esEntregaValida || a.esDevolucionValida)

  // Calculamos los contadores para las pestañas
  const contadorEntregas = avisosEnRangoFechas.filter(a => a.esEntregaValida).length
  const contadorDevoluciones = avisosEnRangoFechas.filter(a => a.esDevolucionValida).length

  // 2. Filtramos por PESTAÑA (Todos / Entregas / Devoluciones)
  const avisosAVisualizar = avisosEnRangoFechas.filter(aviso => {
    if (filtroTipo === 'entregas') return aviso.esEntregaValida
    if (filtroTipo === 'devoluciones') return aviso.esDevolucionValida
    return true
  })

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 print:p-0 print:border-none print:shadow-none print:bg-transparent">
        
        {/* CABECERA Y BOTÓN IMPRIMIR */}
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

        {/* ZONA DE FILTROS (No se imprime) */}
        <div className="mb-8 no-print bg-gray-50 p-6 rounded-2xl border border-gray-200">
          
          {/* BUSCADOR DE FECHAS */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Desde Fecha:</label>
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="p-2 border rounded-lg text-sm font-bold w-full" />
            </div>
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Hasta Fecha:</label>
              <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="p-2 border rounded-lg text-sm font-bold w-full" />
            </div>
            <div className="flex flex-col justify-end h-full mt-4 md:mt-0">
              <button 
                onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                className="text-[10px] font-black text-blue-500 uppercase hover:underline h-[38px] flex items-center px-4"
              >
                Limpiar Fechas
              </button>
            </div>
          </div>

          {/* PESTAÑAS (TABS) */}
          <div className="flex gap-2 border-b border-gray-300">
            <button 
              onClick={() => setFiltroTipo('todos')}
              className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${filtroTipo === 'todos' ? 'border-b-4 border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-t-lg'}`}
            >
              Todas ({avisosEnRangoFechas.length})
            </button>
            <button 
              onClick={() => setFiltroTipo('entregas')}
              className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filtroTipo === 'entregas' ? 'border-b-4 border-orange-500 text-orange-700 bg-orange-50/50 rounded-t-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-t-lg'}`}
            >
              📥 Entregas ({contadorEntregas})
            </button>
            <button 
              onClick={() => setFiltroTipo('devoluciones')}
              className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filtroTipo === 'devoluciones' ? 'border-b-4 border-purple-500 text-purple-700 bg-purple-50/50 rounded-t-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-t-lg'}`}
            >
              📤 Devoluciones ({contadorDevoluciones})
            </button>
          </div>
        </div>

        {/* LISTADO TIPO TABLA */}
        {cargando ? (
          <div className="flex justify-center p-10">
            <p className="font-black text-orange-500 animate-pulse uppercase tracking-widest text-xs">Cargando datos...</p>
          </div>
        ) : avisosAVisualizar.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="font-black text-gray-300 text-lg uppercase tracking-widest mb-2">No hay resultados</p>
            <p className="text-xs text-gray-400 font-bold">Prueba a cambiar las fechas o las pestañas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 print:text-black print:border-black">
                  <th className="py-4 px-2 w-24 text-center">Tipo</th>
                  <th className="py-4 px-2 w-48">Llegada / Entrega</th>
                  <th className="py-4 px-2 w-48">Cliente</th>
                  <th className="py-4 px-2 w-56">Vehículo(s)</th>
                  <th className="py-4 px-2">Notas / Devolución</th>
                  <th className="py-4 px-2 text-right no-print w-32">Estado</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-gray-700">
                {avisosAVisualizar.map((aviso, index) => {
                  
                  // Determinamos visualmente qué tipo de operación estamos viendo si estamos en la pestaña "Todos"
                  let tipoOperacion = "AMBAS"
                  let colorOperacion = "bg-gray-200 text-gray-700"
                  if (filtroTipo === 'entregas' || (filtroTipo === 'todos' && aviso.esEntregaValida && !aviso.esDevolucionValida)) {
                    tipoOperacion = "ENTREGA"
                    colorOperacion = "bg-orange-100 text-orange-800"
                  } else if (filtroTipo === 'devoluciones' || (filtroTipo === 'todos' && !aviso.esEntregaValida && aviso.esDevolucionValida)) {
                    tipoOperacion = "DEVOLUCIÓN"
                    colorOperacion = "bg-purple-100 text-purple-800"
                  }

                  return (
                    <tr key={aviso.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} print:bg-transparent print:border-gray-400`}>
                      
                      {/* TIPO */}
                      <td className="py-4 px-2 align-top text-center">
                         <span className={`${colorOperacion} px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest print:border print:border-black print:bg-transparent print:text-black`}>
                           {tipoOperacion}
                         </span>
                      </td>

                      {/* FECHA ENTREGA */}
                      <td className="py-4 px-2 align-top text-gray-800 font-black tracking-tight">
                        {aviso.fecha}
                      </td>

                      {/* CLIENTE */}
                      <td className="py-4 px-2 align-top">
                        <Link href={`/clientes/${aviso.dni_cliente}`} className="text-blue-700 uppercase hover:underline text-sm font-black tracking-tighter block mb-1 print:text-black print:no-underline">
                          {aviso.cliente}
                        </Link>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest print:text-gray-600">DNI: {aviso.dni_cliente}</span>
                      </td>

                      {/* VEHÍCULOS */}
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

                      {/* BOTÓN COMPLETADO */}
                      <td className="py-4 px-2 align-top text-right no-print">
                        <button 
                          onClick={() => borrarAviso(aviso.id)}
                          className="bg-green-50 text-green-600 px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border border-green-200 hover:bg-green-500 hover:text-white transition-all whitespace-nowrap"
                        >
                          ✓ Listo
                        </button>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body { 
            background: white !important; 
            color: black !important;
            -webkit-print-color-adjust: exact; 
          }
          .no-print { display: none !important; }
          .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  )
}