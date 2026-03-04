
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey.substring(0, 10) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching menu items:', error)
    } else {
        console.log('Successfully fetched menu items:', data)
    }
}

test()
