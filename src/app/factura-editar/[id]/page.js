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
        if (!confirm("¿Deseas anular esta factura de forma permanente?")) return
        setProcesando(true)
        if (!factura.pagado) {
            const { data: cliente } = await supabase.from('clientes').select('saldo_pendiente').eq('dni', factura.dni_cliente).single()
            const nuevoSaldo = Math.max(0, (cliente.saldo_pendiente || 0) - factura.monto)
            await supabase.from('clientes').update({ saldo_pendiente: nuevoSaldo }).eq('dni', factura.dni_cliente)
        }
        await supabase.from('facturas').delete().eq('id', idFactura)
        router.back()
    }

    if (!factura) return <div className="min-h-screen bg-gray-900 flex items-center justify-center font-black text-white uppercase italic tracking-widest">Cargando recibo...</div>

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center font-sans">
            <div className="max-w-lg w-full">
                
                {/* CUERPO DE LA FACTURA PROFESIONAL */}
                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border-t-8 border-blue-600 relative">
                    
                    {/* CABECERA EMPRESA */}
                    <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tighter">AUTOS VICTORIA</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestión de Custodia de Vehículos</p>
                        </div>
                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${factura.pagado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {factura.pagado ? 'FACTURA COBRADA' : 'PAGO PENDIENTE'}
                            </span>
                        </div>
                    </div>

                    {/* DATOS DEL CLIENTE Y FECHA */}
                    <div className="p-8 grid grid-cols-2 gap-4 bg-gray-50/50">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cliente</p>
                            <p className="text-sm font-black text-gray-700 leading-tight uppercase">{factura.nombre_cliente}</p>
                            <p className="text-[11px] font-medium text-gray-500 uppercase">{factura.dni_cliente}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Nº Recibo / Fecha</p>
                            <p className="text-sm font-black text-gray-700">#000{factura.id}</p>
                            <p className="text-[11px] font-medium text-gray-500">{factura.fecha}</p>
                        </div>
                    </div>

                    {/* DETALLE DEL SERVICIO */}
                    <div className="p-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="text-left py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción del Servicio</th>
                                    <th className="text-right py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-6">
                                        <p className="font-black text-gray-800 text-lg leading-tight uppercase">{factura.concepto}</p>
                                        <p className="text-[10px] text-gray-400 font-bold italic mt-1">Servicio prestado en instalaciones de Autos Victoria</p>
                                    </td>
                                    <td className="py-6 text-right font-black text-gray-800 text-2xl tracking-tighter">
                                        {factura.monto}€
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* TOTAL FINAL */}
                    <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
                        <p className="font-black uppercase text-xs tracking-widest">Importe Total Devengado</p>
                        <p className="text-3xl font-black tracking-tighter">{factura.monto}€</p>
                    </div>

                </div>

                {/* ACCIONES (FUERA DE LA FACTURA PARA NO "MANCHARLA") */}
                <div className="mt-8 space-y-3">
                    {!factura.pagado && (
                        <button 
                            onClick={marcarComoPagada} 
                            disabled={procesando}
                            className="w-full bg-green-500 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-green-600 shadow-xl transition-all active:scale-95 disabled:bg-gray-300"
                        >
                            {procesando ? 'Procesando Pago...' : 'Confirmar Cobro de Factura'}
                        </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => router.back()} 
                            className="bg-white text-gray-400 font-black py-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-gray-50 border border-gray-200 transition-all"
                        >
                            Volver
                        </button>
                        <button 
                            onClick={eliminarFactura}
                            disabled={procesando}
                            className="bg-red-50 text-red-500 font-black py-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all border border-red-100"
                        >
                            Anular Factura
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}