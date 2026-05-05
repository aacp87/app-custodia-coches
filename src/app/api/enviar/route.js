import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { emailCliente, nombreCliente, idioma, llegada, salida, notas } = await req.json();

  // ⚠️ CONFIGURA TU CORREO AQUÍ ⚠️
  const MI_CORREO = 'avictoria@infotelecom.es'; // Pon tu correo de AV Menorca
  const MI_PASSWORD = 'tfivfpfxpdpokjfq'; // Pon tu contraseña de aplicación de Google

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MI_CORREO,
      pass: MI_PASSWORD
    }
  });

  // Textos para el cliente según su idioma
  const asuntoCliente = idioma === 'en' ? 'AV Menorca - Booking Confirmation' : 'AV Menorca - Confirmación de Reserva';
  const mensajeCliente = idioma === 'en'
    ? `Hello ${nombreCliente},\n\nWe have successfully received your travel dates for your vehicle custody in Menorca.\n\nArrival: ${llegada}\nDeparture: ${salida}\n\nWe will have your car ready. See you soon!\n\nAV Menorca.`
    : `Hola ${nombreCliente},\n\nHemos recibido correctamente tus fechas para la custodia de tu vehículo en Menorca.\n\nLlegada: ${llegada}\nSalida: ${salida}\n\nTendremos tu coche preparado. ¡Nos vemos pronto!\n\nAV Menorca.`;

  try {
    // 1. Enviar comprobante al Cliente
    await transporter.sendMail({
      from: `"AV Menorca" <${MI_CORREO}>`,
      to: emailCliente,
      subject: asuntoCliente,
      text: mensajeCliente,
    });

    // 2. Enviar aviso a AV Menorca (Tú)
    await transporter.sendMail({
      from: `"Web AV Menorca" <${MI_CORREO}>`,
      to: MI_CORREO,
      subject: `🚨 NUEVA LLEGADA: ${nombreCliente}`,
      text: `El cliente ${nombreCliente} ha enviado nuevas fechas por la web:\n\nLlegada: ${llegada}\nSalida: ${salida}\nNotas del cliente: ${notas}\nEmail contacto: ${emailCliente}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}