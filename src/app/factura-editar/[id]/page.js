'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../supabase'
import { useRouter } from 'next/navigation'

export default function EditarFactura({ params }) {
    const resolvedParams = use(params)
    const idFactura = resolvedParams.id
    const router = useRouter()
    
    const [factura, setFactura] = useState(null)
    const [procesando, setProcesando] = useState(false)
    const [idioma, setIdioma] = useState('es') // 'es' o 'en'

    // Diccionario de textos
    const t = {
        es: {
            titulo: "AV MENORCA",
            subtitulo: "Gestión de Custodia de Vehículos",
            cliente: "Cliente",
            recibo: "Nº Recibo",
            fecha: "Fecha",
            descripcion: "Descripción del Servicio",
            total: "Total",
            importetotal: "Importe Total Devengado",
            pagado: "FACTURA COBRADA",
            pendiente: "PAGO PENDIENTE",
            confirmar: "Confirmar Cobro",
            anular: "Anular Factura",
            volver: "Volver",
            nota: "Servicio prestado en instalaciones de AV MENORCA",
            cargando: "Cargando recibo..."
        },
        en: {
            titulo: "AV MENORCA",
            subtitulo: "Vehicle Storage Management",
            cliente: "Customer",
            recibo: "Receipt No.",
            fecha: "Date",
            descripcion: "Service Description",
            total: "Total",
            importetotal: "Total Amount Due",
            pagado: "PAID IN FULL",
            pendiente: "PAYMENT PENDING",
            confirmar: "Confirm Payment",
            anular: "Void Invoice",
            volver: "Back",
            nota: "Service provided at AV MENORCA facilities",
            cargando: "Loading receipt..."
        }
    }

    useEffect(() => {
        const cargarFactura = async () => {
            const { data } = await supabase.from('facturas').select('*').eq('id', idFactura).single()
            setFactura(data)
        }
        cargarFactura()
    }, [idFactura])

    const marcarComoPagada = async () => {
        setProcesando(true)
        await supabase.from('facturas').update({ pagado: true }).eq('id', idFactura)
        const { data: cliente } = await supabase.from('clientes').select('saldo_pendiente').eq('dni', factura.dni_cliente).single()
        const nuevoSaldo = Math.max(0, (cliente.saldo_pendiente || 0) - factura.monto)
        await supabase.from('clientes').update({ saldo_pendiente: nuevoSaldo }).eq('dni', factura.dni_cliente)
        router.back()
    }

    const eliminarFactura = async () => {
        if (!confirm(idioma === 'es' ? "¿Deseas anular esta factura?" : "Do you want to void this invoice?")) return
        setProcesando(true)
        if (!factura.pagado) {
            const { data: cliente } = await supabase.from('clientes').select('saldo_pendiente').eq('dni', factura.dni_cliente).single()
            const nuevoSaldo = Math.max(0, (cliente.saldo_pendiente || 0) - factura.monto)
            await supabase.from('clientes').update({ saldo_pendiente: nuevoSaldo }).eq('dni', factura.dni_cliente)
        }
        await supabase.from('facturas').delete().eq('id', idFactura)
        router.back()
    }

    if (!factura) return <div className="min-h-screen bg-gray-900 flex items-center justify-center font-black text-white uppercase italic">{t[idioma].cargando}</div>

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
            
            {/* SELECTOR DE IDIOMA */}
            <div className="flex bg-white p-1 rounded-full shadow-md mb-6 border border-gray-200">
                <button 
                    onClick={() => setIdioma('es')}
                    className={`px-6 py-2 rounded-full text-[10px] font-black transition-all ${idioma === 'es' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    ESPAÑOL
                </button>
                <button 
                    onClick={() => setIdioma('en')}
                    className={`px-6 py-2 rounded-full text-[10px] font-black transition-all ${idioma === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    ENGLISH
                </button>
            </div>

            <div className="max-w-lg w-full">
                {/* CUERPO DE LA FACTURA */}
                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border-t-8 border-blue-600">
                    
                    <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tighter">{t[idioma].titulo}</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t[idioma].subtitulo}</p>
                        </div>
                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${factura.pagado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {factura.pagado ? t[idioma].pagado : t[idioma].pendiente}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-2 gap-4 bg-gray-50/50">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t[idioma].cliente}</p>
                            <p className="text-sm font-black text-gray-700 leading-tight uppercase">{factura.nombre_cliente}</p>
                            <p className="text-[11px] font-medium text-gray-500">{factura.dni_cliente}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t[idioma].recibo} / {t[idioma].fecha}</p>
                            <p className="text-sm font-black text-gray-700">#000{factura.id}</p>
                            <p className="text-[11px] font-medium text-gray-500">{factura.fecha}</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="text-left py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t[idioma].descripcion}</th>
                                    <th className="text-right py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t[idioma].total}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-800 text-lg leading-tight uppercase">{factura.concepto}</p>
                                        <p className="text-[10px] text-gray-400 font-bold italic mt-1">{t[idioma].nota}</p>
                                    </td>
                                    <td className="py-6 text-right font-black text-gray-800 text-2xl tracking-tighter">
                                        {factura.monto}€
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
                        <p className="font-black uppercase text-xs tracking-widest">{t[idioma].importetotal}</p>
                        <p className="text-3xl font-black tracking-tighter">{factura.monto}€</p>
                    </div>

                </div>

                {/* ACCIONES */}
                <div className="mt-8 space-y-3">
                    {!factura.pagado && (
                        <button 
                            onClick={marcarComoPagada} 
                            disabled={procesando}
                            className="w-full bg-green-500 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-green-600 shadow-xl transition-all active:scale-95 disabled:bg-gray-300"
                        >
                            {t[idioma].confirmar}
                        </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => router.back()} 
                            className="bg-white text-gray-400 font-black py-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-gray-50 border border-gray-200 transition-all"
                        >
                            {t[idioma].volver}
                        </button>
                        <button 
                            onClick={eliminarFactura}
                            disabled={procesando}
                            className="bg-red-50 text-red-500 font-black py-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all border border-red-100"
                        >
                            {t[idioma].anular}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}