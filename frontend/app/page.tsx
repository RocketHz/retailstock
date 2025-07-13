import { CardContent } from "@/components/ui/card"
import { CardDescription } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "secondary" | "ghost"
    size?: "sm" | "md" | "lg"
    asChild?: boolean
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            La Plataforma Global de <span className="text-blue-600">Gestión de Inventario</span> para Minoristas
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Simplifica la complejidad de la gestión multicanal y multilocación. Reduce costos, previene
            desabastecimientos y mejora la satisfacción del cliente con nuestra solución SaaS escalable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild className="text-lg px-8 py-3">
              <Link href="/register">Comenzar Prueba Gratuita</Link>
            </Button>
            <Button asChild className="text-lg text-black hover:text-white px-8 py-3 bg-blue-600 hover:bg-blue-800">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Únete a miles de minoristas que ya optimizan su inventario con RetailStock
          </p>
        </div>

        {/* Value Proposition */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Seguimiento en Tiempo Real</CardTitle>
              <CardDescription>Actualización constante que permite decisiones inmediatas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                No solo "casi real", sino seguimiento constante de tu inventario con alertas automatizadas inteligentes
                que sugieren acciones basadas en tendencias y pronósticos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Pronósticos con IA</CardTitle>
              <CardDescription>Machine Learning para predicción de demanda precisa</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Algoritmos avanzados que consideran estacionalidad, promociones y eventos externos para predecir la
                demanda futura con alta precisión.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Optimización Multilocación</CardTitle>
              <CardDescription>Sugerencias inteligentes para maximizar eficiencia</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Recomendaciones para mover inventario entre ubicaciones, reducir tiempos de entrega y maximizar la
                disponibilidad de productos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Global Features */}
        <div className="bg-white rounded-2xl p-8 mb-16 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Enfoque Global Intencional</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Soporte Multilingüe</h3>
              <p className="text-sm text-gray-600">Interfaz disponible en múltiples idiomas para minoristas globales</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multidivisa</h3>
              <p className="text-sm text-gray-600">Gestión de inventario en diferentes monedas y regiones</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cumplimiento Regulatorio</h3>
              <p className="text-sm text-gray-600">Soporte para diferentes normativas fiscales por región</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">APIs Documentadas</h3>
              <p className="text-sm text-gray-600">Integración sencilla con sistemas existentes</p>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Integraciones Plug-and-Play</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Conecta fácilmente con las plataformas de comercio electrónico más populares, sistemas ERP y proveedores de
            logística
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            {["Shopify", "Magento", "WooCommerce", "BigCommerce", "QuickBooks", "NetSuite"].map((platform) => (
              <div key={platform} className="bg-white p-4 rounded-lg shadow-sm border">
                <p className="font-medium text-gray-700">{platform}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Tiers Preview */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Escalable para Todos los Tamaños</h2>
          <p className="text-lg text-gray-600 mb-8">Desde pequeñas boutiques hasta grandes cadenas minoristas</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Básico</CardTitle>
                <CardDescription>Perfecto para pequeños minoristas</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Hasta 3 ubicaciones</li>
                  <li>• 1,000 SKUs</li>
                  <li>• Seguimiento en tiempo real</li>
                  <li>• Alertas básicas</li>
                  <li>• Soporte por email</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Más Popular</span>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Estándar</CardTitle>
                <CardDescription>Ideal para minoristas medianos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Hasta 10 ubicaciones</li>
                  <li>• 10,000 SKUs</li>
                  <li>• Gestión de pedidos</li>
                  <li>• Informes detallados</li>
                  <li>• Integraciones estándar</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500">
              <CardHeader>
                <CardTitle className="text-xl">Premium</CardTitle>
                <CardDescription>Para grandes cadenas minoristas</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Ubicaciones ilimitadas</li>
                  <li>• SKUs ilimitados</li>
                  <li>• Pronósticos con IA</li>
                  <li>• Integraciones personalizadas</li>
                  <li>• Soporte dedicado</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ROI Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Alto Retorno de Inversión Garantizado</h2>
          <p className="text-xl mb-6 opacity-90">
            Reduce costos operativos, disminuye pérdidas por desabastecimiento y aumenta ventas
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div>
              <div className="text-3xl font-bold mb-2">-25%</div>
              <p className="text-sm opacity-90">Reducción en costos de inventario</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">+15%</div>
              <p className="text-sm opacity-90">Aumento en disponibilidad de productos</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">-40%</div>
              <p className="text-sm opacity-90">Menos tiempo en gestión manual</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
