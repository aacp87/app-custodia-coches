'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'

// Función mágica que averigua qué día es "hoy"
const obtenerFechaHoy = () => {
  const fecha = new Date()
  const año = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

export default function DiarioPage() {
  const [operaciones, setOperaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  // ESTADOS PARA LOS FILTROS (Empiezan vacíos, pero se rellenarán con 'hoy' al instante)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  const cargarDiario = async () => {
    const { data: diarioData } = await supabase.from('diario').select('*')
    const { data: vehiculosData } = await supabase.from('vehiculos').select('*')

    if (diarioData) {
      let eventosDesdoblados = []

      diarioData.forEach(aviso => {
        const cochesDelCliente = vehiculosData ? vehiculosData.filter(v => v.nombre_cliente === aviso.cliente) : []
        
        const partesEntrega = aviso.fecha.includes(' a las ') ? aviso.fecha.split(' a las ') : aviso.fecha.split('T')
        const fechaEntrega = partesEntrega[0]
        const horaEntrega = partesEntrega[1] ? partesEntrega[1].replace('h','') : ''

        eventosDesdoblados.push({
          ...aviso,
          coches: cochesDelCliente,
          op_tipo: 'ENTREGA',
          op_fecha: fechaEntrega,
          op_hora: horaEntrega,
          id_unica_ui: aviso.id + '-E'
        })

        const matchDevolucion = aviso.notas.match(/SE DEVUELVE EL:\s*(\d{4}-\d{2}-\d{2})\s*a las\s*(\d{2}:\d{2})/i)
        
        if (matchDevolucion) {
          eventosDesdoblados.push({
            ...aviso,
            coches: cochesDelCliente,
            op_tipo: 'DEVOLUCIÓN',
            op_fecha: matchDevolucion[1],
            op_hora: matchDevolucion[2],
            id_unica_ui: aviso.id + '-D'
          })
        }
      })

      eventosDesdoblados.sort((a, b) => {
        const fhA = `${a.op_fecha}T${a.op_hora}`
        const fhB = `${b.op_fecha}T${b.op_hora}`
        return fhA.localeCompare(fhB)
      })

      setOperaciones(eventosDesdoblados)
    }
    setCargando(false)
  }

  // AL ARRANCAR LA PÁGINA: Ponemos la fecha de hoy automáticamente y luego cargamos los datos
  useEffect(() => { 
    const hoy = obtenerFechaHoy()
    setFechaDesde(hoy)
    setFechaHasta(hoy)
    cargarDiario() 
  }, [])

  const borrarRegistroOriginal = async (id) => {
    if (confirm("Al completar esto se borrará todo el registro (la entrega y la devolución) del diario. ¿Continuar?")) {
      await supabase.from('diario').delete().eq('id', id)
      cargarDiario()
    }
  }

  // LÓGICA INTELIGENTE DE FILTRADO
  const operacionesEnRango = operaciones.filter(op => {
    let valido = true
    if (fechaDesde && op.op_fecha < fechaDesde) valido = false
    if (fechaHasta && op.op_fecha > fechaHasta) valido = false
    return valido
  })

  const contadorEntregas = operacionesEnRango.filter(o => o.op_tipo === 'ENTREGA').length
  const contadorDevoluciones = operacionesEnRango.filter(o => o.op_tipo === 'DEVOLUCIÓN').length

  const operacionesAVisualizar = operacionesEnRango.filter(o => {
    if (filtroTipo === 'entregas') return o.op_tipo === 'ENTREGA'
    if (filtroTipo === 'devoluciones') return o.op_tipo === 'DEVOLUCIÓN'
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
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1 print:text-black">AV MENORCA - Listado de Operaciones</p>
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

        {/* ZONA DE FILTROS */}
        <div className="mb-8 no-print bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Desde Fecha:</label>
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="p-2 border rounded-lg text-sm font-bold w-full text-blue-800 bg-blue-50 focus:bg-white transition-colors" />
            </div>
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Hasta Fecha:</label>
              <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="p-2 border rounded-lg text-sm font-bold w-full text-blue-800 bg-blue-50 focus:bg-white transition-colors" />
            </div>
            <div className="flex flex-col justify-end h-full mt-4 md:mt-0">
              <button 
                onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                className="text-[10px] font-black text-gray-500 uppercase hover:text-blue-600 hover:underline h-[38px] flex items-center px-4"
              >
                Limpiar Fechas (Ver Todo)
              </button>
            </div>
          </div>

          {/* PESTAÑAS (TABS) */}
          <div className="flex gap-2 border-b border-gray-300">
            <button 
              onClick={() => setFiltroTipo('todos')}
              className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${filtroTipo === 'todos' ? 'border-b-4 border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-t-lg'}`}
            >
              Todas ({operacionesEnRango.length})
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
            <p className="font-black text-orange-500 animate-pulse uppercase tracking-widest text-xs">Cargando operaciones de hoy...</p>
          </div>
        ) : operacionesAVisualizar.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="font-black text-gray-300 text-lg uppercase tracking-widest mb-2">Día libre 🌴</p>
            <p className="text-xs text-gray-400 font-bold">No hay entregas ni devoluciones programadas para las fechas seleccionadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 print:text-black print:border-black">
                  <th className="py-4 px-2 w-24 text-center">Tipo</th>
                  <th className="py-4 px-2 w-48">Día y Hora</th>
                  <th className="py-4 px-2 w-48">Cliente</th>
                  <th className="py-4 px-2 w-56">Vehículo(s)</th>
                  <th className="py-4 px-2">Detalles / Notas</th>
                  <th className="py-4 px-2 text-right no-print w-32">Estado</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-gray-700">
                {operacionesAVisualizar.map((op, index) => {
                  
                  const esEntrega = op.op_tipo === 'ENTREGA'
                  const colorEtiqueta = esEntrega ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-purple-100 text-purple-800 border-purple-200"

                  return (
                    <tr key={op.id_unica_ui} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} print:bg-transparent print:border-gray-400`}>
                      
                      <td className="py-4 px-2 align-top text-center">
                         <span className={`${colorEtiqueta} border px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest print:border print:border-black print:bg-transparent print:text-black`}>
                           {op.op_tipo}
                         </span>
                      </td>

                      <td className="py-4 px-2 align-top text-gray-800 font-black tracking-tight">
                        <span className={esEntrega ? 'text-orange-600' : 'text-purple-600'}>{op.op_fecha}</span> <br/>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">a las {op.op_hora}h</span>
                      </td>

                      <td className="py-4 px-2 align-top">
                        <Link href={`/clientes/${op.dni_cliente}`} className="text-blue-700 uppercase hover:underline text-sm font-black tracking-tighter block mb-1 print:text-black print:no-underline">
                          {op.cliente}
                        </Link>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest print:text-gray-600">DNI: {op.dni_cliente}</span>
                      </td>

                      <td className="py-4 px-2 align-top">
                        {op.coches && op.coches.length > 0 ? (
                          <div className="space-y-1">
                            {op.coches.map(coche => (
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

                      <td className="py-4 px-2 align-top">
                        <p className="whitespace-pre-wrap text-gray-600 font-medium text-[11px] print:text-black leading-relaxed">
                          {op.notas}
                        </p>
                      </td>

                      <td className="py-4 px-2 align-top text-right no-print">
                        <button 
                          onClick={() => borrarRegistroOriginal(op.id)}
                          className="bg-gray-50 text-gray-500 px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border border-gray-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all whitespace-nowrap"
                          title="Borrará tanto la entrega como la devolución del sistema"
                        >
                          ✕ Borrar Registro
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
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  )
}