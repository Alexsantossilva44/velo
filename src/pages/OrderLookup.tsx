import { useState } from 'react'
import { Search, Package, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice, Order } from '@/store/configuratorStore'
import { CAR_IMAGES, COLOR_LABELS } from '@/lib/carAssets'
import { getOrderByNumber } from '@/hooks/useOrders'
import Header from '@/components/landing/Header'

const statusStyles: Record<Order['status'], { badgeClass: string; Icon: typeof CheckCircle }> = {
  APROVADO: { badgeClass: 'bg-green-100 text-green-700', Icon: CheckCircle },
  EM_ANALISE: { badgeClass: 'bg-amber-100 text-amber-700', Icon: Clock },
  REPROVADO: { badgeClass: 'bg-red-100 text-red-700', Icon: XCircle },
}

function Field({ label, value, capitalize }: { label: string; value: React.ReactNode; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className={`font-medium${capitalize ? ' capitalize' : ''}`}>{value}</p>
    </div>
  )
}

const OrderLookup = () => {
  const [orderId, setOrderId] = useState('')
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotFound(false)
    setSearchedOrder(null)
    setIsLoading(true)

    const { order, error } = await getOrderByNumber(orderId)

    setIsLoading(false)

    if (error) {
      setNotFound(true)
      return
    }

    if (order) {
      setSearchedOrder(order)
    } else {
      setNotFound(true)
    }
  }

  const statusInfo = searchedOrder ? statusStyles[searchedOrder.status] : null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-2xl pt-24">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">Consultar Pedido</CardTitle>
            <p className="text-muted-foreground mt-2">Digite o número do seu pedido para verificar o status</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="order-id">Número do Pedido</Label>
                <Input
                  id="order-id"
                  type="text"
                  placeholder="Ex: VLO-ABC123"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                data-testid="search-order-button"
                className="w-full"
                disabled={!orderId.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Pedido
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Not Found Message */}
        {notFound && (
          <Card className="border-destructive/50 bg-destructive/5 animate-fade-in" data-testid="order-not-found">
            <CardContent className="py-8 text-center">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Pedido não encontrado</h3>
              <p className="text-muted-foreground">Verifique o número do pedido e tente novamente</p>
            </CardContent>
          </Card>
        )}

        {/* Order Result */}
        {searchedOrder && (
          <Card className="animate-fade-in" data-testid={`order-result-${searchedOrder.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pedido</p>
                    <p data-testid="order-number" className="font-mono font-medium">
                      {searchedOrder.id}
                    </p>
                  </div>
                </div>
                <div
                  role="status"
                  data-testid="order-status"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusInfo?.badgeClass}`}
                >
                  {statusInfo && <statusInfo.Icon className="w-4 h-4" />}
                  {searchedOrder.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Car Image */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <img
                  src={CAR_IMAGES[searchedOrder.configuration.exteriorColor][searchedOrder.configuration.wheelType]}
                  alt="Velô Sprint"
                  className="w-full max-w-xs mx-auto"
                />
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="Modelo" value="Velô Sprint" />
                <Field label="Cor" value={COLOR_LABELS[searchedOrder.configuration.exteriorColor]} />
                <Field
                  label="Interior"
                  value={searchedOrder.configuration.interiorColor.replace('-', ' ')}
                  capitalize
                />
                <Field label="Rodas" value={`${searchedOrder.configuration.wheelType} Wheels`} capitalize />
              </div>

              {/* Customer Info */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Dados do Cliente</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Nome" value={`${searchedOrder.customer.name} ${searchedOrder.customer.surname}`} />
                  <Field label="Email" value={searchedOrder.customer.email} />
                  <Field label="Loja de Retirada" value={searchedOrder.customer.store} />
                  <Field label="Data do Pedido" value={new Date(searchedOrder.createdAt).toLocaleDateString('pt-BR')} />
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Pagamento</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {searchedOrder.paymentMethod === 'avista' ? 'À Vista' : 'Financiamento 12x'}
                    </p>
                    {searchedOrder.paymentMethod === 'financiamento' && searchedOrder.installmentValue && (
                      <p className="text-sm text-muted-foreground">
                        12x de {formatPrice(searchedOrder.installmentValue)}
                      </p>
                    )}
                  </div>
                  <p className="text-xl font-display font-semibold text-foreground">
                    {formatPrice(searchedOrder.totalPrice)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default OrderLookup
