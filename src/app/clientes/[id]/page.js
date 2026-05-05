'use client'
import { useEffect, useState, use, useRef } from 'react'
import { supabase } from '../../../supabase' 
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react' // Librería para el QR

export default function FichaCliente({ params }) {
  const resolvedParams = use(params)
  const dniDeLaUrl = resolvedParams.id 

  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const qrRef = useRef()

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

  // Función para imprimir solo el QR si lo necesitas
  const imprimirQR = () => {
    window.print()
  }

  if (cargando) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-white font-black animate-pulse uppercase tracking-widest">Cargando Expediente...</p></div>
  if (!cliente) return <p className="p-10 text-center uppercase font-bold text-red-500">Cliente no encontrado</p>

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <Link href="/clientes" className="text-blue-600 font-bold text-[10px] uppercase italic hover:underline tracking-widest">← Volver al Listado</Link>
            <h1 className="text-5xl font-black text-gray-800 uppercase tracking-tighter mt-2">{cliente.nombre}</h1>
          </div>
          <div className="flex gap-3 no-print">
             <Link href={`/nuevo?cliente=${cliente.nombre}`}>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">
                  + Añadir Vehículo
                </button>
             </Link>
             <Link href={`/factura-nueva?cliente=${cliente.nombre}&dni=${cliente.dni}`}>
                <button className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all">
                  + Crear Factura
                </button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA 1: CONTACTO Y QR */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 italic underline">Ficha de Contacto</h2>
              <div className="space-y-2 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">DNI: <span className="text-gray-800 font-black">{cliente.dni}</span></p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Teléfono: <span className="text-gray-800 font-black">{cliente.telefono}</span></p>
              </div>

              {/* GENERADOR DE QR */}
              <div className="border-t pt-6 flex flex-col items-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Código QR del Vehículo</p>
                <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-inner">
                  <QRCodeSVG 
                    value={`https://avmenorca.com/clientes/${cliente.dni}`} 
                    size={120}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <p className="text-[10px] font-black text-blue-600 mt-4 uppercase">Escanear para abrir ficha</p>
                <button 
                  onClick={() => window.print()}
                  className="mt-4 text-[9px] font-bold text-gray-300 hover:text-gray-500 uppercase underline no-print"
                >
                  Imprimir etiqueta
                </button>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 text-center no-print">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Saldo Total Pendiente</p>
              <p className="text-6xl font-black text-red-600 my-2 tracking-tighter">{cliente.saldo_pendiente || 0}€</p>
            </div>
          </div>

          {/* COLUMNA 2: VEHÍCULOS */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 no-print">
            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-6 italic underline">Flota en Custodia</h2>
            <div className="space-y-6">
              {vehiculos.map(v => (
                <div key={v.id} className="border-b pb-6 last:border-0">
                  <p className="font-black text-gray-800 uppercase text-lg leading-tight">{v.marca_modelo}</p>
                  <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-3 py-1 rounded-full uppercase">{v.matricula}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA 3: FACTURAS */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 no-print">
            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-6 italic underline">Historial de Cargos</h2>
            <div className="space-y-3">
              {facturas.map(f => (
                <Link href={`/factura-editar/${f.id}`} key={f.id} className="block group">
                  <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100 group-hover:bg-blue-50 transition-all">
                    <div>
                      <p className="font-black text-gray-700 uppercase text-[10px]">{f.concepto}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{f.fecha}</p>
                    </div>
                    <p className="font-black text-gray-800 text-sm">{f.monto}€</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ESTILOS PARA IMPRESIÓN (Para que solo salga el QR al imprimir) */}
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