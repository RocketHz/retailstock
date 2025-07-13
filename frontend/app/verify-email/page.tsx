"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { apiRequest } from "@/lib/api"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setStatus("error")
        setMessage("Invalid verification link. Please check your email and try again.")
        return
      }

      try {
        const response = await apiRequest(`/api/auth/verify-email/${token}`)

        if (response?.ok) {
          setStatus("success")
          setMessage("¡Tu cuenta ha sido verificada exitosamente! Ya puedes iniciar sesión.")

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        } else {
          const data = await response?.json()
          setStatus("error")
          setMessage(data.error || "Error de verificación. El enlace puede ser inválido o haber expirado.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Network error. Please check your connection and try again.")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verificación de Correo</CardTitle>
          <CardDescription className="text-center">Verificando tu dirección de correo electrónico...</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Verificando tu dirección de correo electrónico...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600">Redirigiendo a la página de inicio de sesión en unos segundos...</p>
              <Button asChild className="w-full">
                <Link href="/login">Ir a Iniciar Sesión</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 mx-auto text-red-600" />
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{message}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/login">Ir a Iniciar Sesión</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/register">Crear Nueva Cuenta</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
