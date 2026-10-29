// ATL Coach - configuración (mismo proyecto Supabase que la app de clientes)
window.ATL = {
  SUPABASE_URL: 'https://cejgurbaweucfpuzvdpw.supabase.co',
  SUPABASE_ANON: 'sb_publishable_qXqEI0bVkwXtH8eqByoPqQ_9dVp8KTI',
  LOGO: 'https://static.wixstatic.com/media/9d1be0_e4ee180b08184d159adbfa2a55f4ace3~mv2.png/v1/fill/w_405,h_254/ATLLogoColores.png',
  RESET_URL: 'https://clientes.athletetrainlab.com/clave',
};
window.sbClient = supabase.createClient(ATL.SUPABASE_URL, ATL.SUPABASE_ANON);
