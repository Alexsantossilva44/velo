import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { generateOrderCode } from '../support/helpers'

export const E2E_TEST_EMAIL = 'e2e-test@velo.local'

type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'

function getSupabase(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error('Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são obrigatórias para os testes E2E.')
  }

  return createClient(url, key)
}

export async function createTestOrder(status: OrderStatus = 'APROVADO'): Promise<string> {
  const supabase = getSupabase()
  const orderNumber = generateOrderCode()

  const { error } = await supabase.from('orders').insert({
    order_number: orderNumber,
    color: 'glacier-blue',
    wheel_type: 'aero',
    optionals: [],
    customer_name: 'Teste E2E',
    customer_email: E2E_TEST_EMAIL,
    customer_phone: '(21) 99999-9999',
    customer_cpf: '191.366.520-83',
    payment_method: 'avista',
    total_price: 50500,
    status,
  })

  if (error) {
    throw new Error(`Falha ao criar pedido de teste: ${error.message}`)
  }

  return orderNumber
}

export async function deleteTestOrder(orderNumber: string): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('order_number', orderNumber)
    .eq('customer_email', E2E_TEST_EMAIL)

  if (error) {
    throw new Error(`Falha ao remover pedido de teste ${orderNumber}: ${error.message}`)
  }
}
