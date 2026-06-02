import { supabase } from './supabase'

export async function probarConexion() {

  const { data, error } = await supabase
    .from('eventos')
    .select('*')

  console.log('DATA:', data)
  console.log('ERROR:', error)
}