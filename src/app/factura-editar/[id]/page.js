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
        
        // 1. Marcar la factura como pagada en la tabla facturas
        await supabase.from('facturas').update({ pagado: true }).eq('id', idFactura)
        
        // 2. Restar el importe del saldo total del cliente
        const { data: cliente } = await supabase.from('clientes')
            .select('saldo_pendiente')
            .eq('dni', factura.dni_cliente)
            .single()

        const nuevoSaldo = Math.max(0, (cliente.saldo_pendiente || 0) - factura.monto)
        
        await supabase.from('clientes')
            .update({ saldo_pendiente: nuevoSaldo })
            .eq('dni', factura.dni_cliente)
        
        router.back()
    }

    const eliminarFactura = async () => {
        if (!confirm("¿Seguro que quieres borrar este cargo?")) return
        setProcesando(true)

        // Si borras una factura pendiente, restamos el importe de la deuda global
        if (!factura.pagado) {
            const { data: cliente } = await supabase.from('clientes').select('saldo_pendiente').eq('dni', factura.dni_cliente).single()
            const nuevoSaldo = Math.max(0, (cliente.saldo_pendiente || 0) - factura.monto)
            await supabase.from('clientes').update({ saldo_pendiente: nuevoSaldo }).eq('dni', factura.dni_cliente)
        }

        await supabase.from('facturas').delete().eq('id', idFactura)
        router.back()
    }

    if (!factura) return <div className="min-h-screen bg-gray-900 flex items-center justify-center font-black text-white uppercase">Cargando factura...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 text-center">
                <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-8">Editar Cargo</h1>
                
                <div className="bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-100">
                    <p className="text-xs font-black text-blue-600 uppercase italic mb-1">{factura.concepto}</p>
                    <p className="text-5xl font-black text-blue-900">{factura.monto}€</p>
                    <p className={`text-[10px] font-black mt-3 uppercase ${factura.pagado ? 'text-green-500' : 'text-red-500'}`}>
                        Estado: {factura.pagado ? 'PAGADO' : 'PENDIENTE'}
                    </p>
                </div>

                <div className="space-y-3">
                    {!factura.pagado && (
                        <button 
                            onClick={marcarComoPagada} 
                            disabled={procesando}
                            className="w-full bg-green-500 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-green-600 shadow-lg transition-all disabled:bg-gray-200"
                        >
                            ✅ Marcar como Pagado
                        </button>
                    )}
                    
                    <button 
                        onClick={eliminarFactura}
                        disabled={procesando}
                        className="w-full bg-white text-red-500 border-2 border-red-50 font-black py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-red-50 transition-all"
                    >
                        🗑️ Borrar Factura
                    </button>

                    <button 
                        onClick={() => router.back()} 
                        className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4"
                    >
                        ← Volver atrás
                    </button>
                </div>
            </div>
        </div>
    )
}