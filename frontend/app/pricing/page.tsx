import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Planes Diseñados para Cada Tipo de Minorista</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desde pequeñas boutiques hasta grandes cadenas. Elige el plan que mejor se adapte a tu negocio y escala
            cuando lo necesites.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Plan Básico */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Básico</CardTitle>
              <CardDescription>Perfecto para pequeños minoristas que están comenzando</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$49</span>
                <span className="text-gray-600">/mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Hasta 3 ubicaciones</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>1,000 SKUs incluidos</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Seguimiento en tiempo real</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Alertas básicas de stock</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Hasta 3 usuarios</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Soporte por email</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Integraciones básicas</span>
                </li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/register">Comenzar Prueba Gratuita</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Plan Estándar */}
          <Card className="relative border-2 border-blue-500">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Más Popular</span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Estándar</CardTitle>
              <CardDescription>Ideal para minoristas medianos en crecimiento</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$149</span>
                <span className="text-gray-600">/mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Hasta 10 ubicaciones</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>10,000 SKUs incluidos</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Gestión avanzada de pedidos</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Informes detallados y analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Hasta 10 usuarios</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Soporte prioritario</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Integraciones estándar (Shopify, WooCommerce)</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Pronósticos básicos</span>
                </li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/register">Comenzar Prueba Gratuita</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Plan Premium */}
          <Card className="relative border-2 border-purple-500">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">Empresarial</span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>Para grandes cadenas minoristas y empresas</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">Personalizado</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Ubicaciones ilimitadas</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>SKUs ilimitados</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Pronósticos avanzados con IA</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Integraciones personalizadas</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Usuarios ilimitados</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Soporte dedicado 24/7</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>API de alto volumen</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Módulos especializados</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/contact">Contactar Ventas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add-ons Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Módulos Adicionales</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Módulo de Auditoría Avanzada</CardTitle>
                <CardDescription>Para minoristas que requieren trazabilidad completa</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Seguimiento de lotes para alimentos</li>
                  <li>• Números de serie para electrónicos</li>
                  <li>• Historial completo de movimientos</li>
                  <li>• Reportes de cumplimiento</li>
                </ul>
                <p className="mt-4 font-semibold">+$29/mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Módulo de Devoluciones Inteligentes</CardTitle>
                <CardDescription>Gestión automatizada de devoluciones y restock</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Procesamiento automático de devoluciones</li>
                  <li>• Evaluación de condición de productos</li>
                  <li>• Restock inteligente</li>
                  <li>• Analytics de patrones de devolución</li>
                </ul>
                <p className="mt-4 font-semibold">+$39/mes</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Factors */}
        <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Factores que Influyen en el Precio</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Escalabilidad</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Número de ubicaciones</li>
                <li>• Cantidad de SKUs (productos)</li>
                <li>• Volumen de transacciones/pedidos</li>
                <li>• Número de usuarios de la plataforma</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Funcionalidades</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Pronósticos avanzados con IA</li>
                <li>• Integraciones personalizadas</li>
                <li>• Nivel de soporte al cliente</li>
                <li>• Módulos especializados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
