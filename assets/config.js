// ATL Fichas Clientes - configuración compartida
window.ATL = {
  SUPABASE_URL: 'https://wmmfsblgrusvbaugcihp.supabase.co',
  SUPABASE_ANON: 'sb_publishable_iC4xe9jDAnxnn5Dwj-XARw_3nvPFhGf',
  LOGO: 'https://static.wixstatic.com/media/9d1be0_e4ee180b08184d159adbfa2a55f4ace3~mv2.png/v1/fill/w_405,h_254/ATLLogoColores.png',
  WHATSAPP: 'https://wa.me/50688445505',
  DISCIPLINAS: [
    { id: 'natacion', nombre: 'Natación', icono: '🏊' },
    { id: 'ruta', nombre: 'Ruta', icono: '🚴' },
    { id: 'mtb', nombre: 'MTB', icono: '🚵' },
    { id: 'correr', nombre: 'Correr', icono: '🏃' },
    { id: 'trail', nombre: 'Trail', icono: '⛰️' },
  ],
  DIAS: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
};
window.sbClient = supabase.createClient(ATL.SUPABASE_URL, ATL.SUPABASE_ANON);

ATL.fmtMonto = (m, mon = 'CRC') => (mon === 'USD' ? '$' : '₡') + Number(m).toLocaleString('es-CR');
ATL.fmtFecha = (f) => f ? new Date(f + 'T12:00:00').toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
ATL.hoy = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' });

// Estado de pago: verde (al día), amarillo (ventana de pago / en revisión), rojo (vencido)
ATL.estadoPago = (cliente, tienePendiente) => {
  if (!cliente.proximo_pago) return { clase: 'gris', texto: 'Confirma tu correo para activar tu fecha de pago', pct: 0 };
  if (tienePendiente) return { clase: 'amarillo', texto: 'Comprobante en revisión', pct: 66 };
  const dias = Math.floor((new Date(cliente.proximo_pago) - new Date(ATL.hoy())) / 86400000);
  if (dias < 0) return { clase: 'rojo', texto: `Pago vencido hace ${-dias} día${dias === -1 ? '' : 's'}`, pct: 100 };
  if (dias <= 5) return { clase: 'amarillo', texto: dias === 0 ? 'Tu pago vence hoy: sube tu comprobante' : `Tu pago vence en ${dias} día${dias === 1 ? '' : 's'}`, pct: 66 };
  return { clase: 'verde', texto: `Al día · próximo pago: ${ATL.fmtFecha(cliente.proximo_pago)}`, pct: 33 };
};
