"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useIntegrations } from "@/lib/integrations-context"
import { Eye, EyeOff } from "lucide-react"

interface WooCommerceConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WooCommerceConnectionDialog({ open, onOpenChange }: WooCommerceConnectionDialogProps) {
  const { connectWooCommerce, isLoading } = useIntegrations()
  const [formData, setFormData] = useState({
    store_url: "",
    api_key_public: "",
    api_key_secret: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSecrets, setShowSecrets] = useState({
    api_key_public: false,
    api_key_secret: false,
  })

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Alternar visibilidad de campos secretos
  const toggleSecretVisibility = (field: "api_key_public" | "api_key_secret") => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.store_url.trim()) {
      newErrors.store_url = "La URL de la tienda es obligatoria"
    } else if (!formData.store_url.startsWith("http")) {
      newErrors.store_url = "La URL debe incluir http:// o https://"
    }

    if (!formData.api_key_public.trim()) {
      newErrors.api_key_public = "La Consumer Key es obligatoria"
    }

    if (!formData.api_key_secret.trim()) {
      newErrors.api_key_secret = "La Consumer Secret es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const result = await connectWooCommerce(formData)

    if (result.success) {
      handleOpenChange(false)
    }
  }

  // Resetear formulario al cerrar
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        store_url: "",
        api_key_public: "",
        api_key_secret: "",
      })
      setErrors({})
      setShowSecrets({
        api_key_public: false,
        api_key_secret: false,
      })
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">🛒</span>
            <span>Conectar con WooCommerce</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
            <h4 className="font-medium text-purple-900 mb-2">¿Cómo obtener las claves API de WooCommerce?</h4>
            <ol className="text-sm text-purple-800 space-y-1">
              <li>1. Ve a tu panel de WordPress → WooCommerce → Configuración → Avanzado → REST API</li>
              <li>2. Haz clic en "Agregar clave"</li>
              <li>3. Selecciona permisos de "Lectura/Escritura"</li>
              <li>4. Copia la Consumer Key y Consumer Secret</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_url">URL de la Tienda WooCommerce</Label>
              <Input
                id="store_url"
                name="store_url"
                value={formData.store_url}
                onChange={handleChange}
                placeholder="https://mi-tienda.com"
                className={errors.store_url ? "border-red-500" : ""}
              />
              {errors.store_url && <p className="text-sm text-red-500">{errors.store_url}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key_public">Consumer Key</Label>
              <div className="relative">
                <Input
                  id="api_key_public"
                  name="api_key_public"
                  type={showSecrets.api_key_public ? "text" : "password"}
                  value={formData.api_key_public}
                  onChange={handleChange}
                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className={`pr-10 ${errors.api_key_public ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => toggleSecretVisibility("api_key_public")}
                >
                  {showSecrets.api_key_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.api_key_public && <p className="text-sm text-red-500">{errors.api_key_public}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key_secret">Consumer Secret</Label>
              <div className="relative">
                <Input
                  id="api_key_secret"
                  name="api_key_secret"
                  type={showSecrets.api_key_secret ? "text" : "password"}
                  value={formData.api_key_secret}
                  onChange={handleChange}
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className={`pr-10 ${errors.api_key_secret ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => toggleSecretVisibility("api_key_secret")}
                >
                  {showSecrets.api_key_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.api_key_secret && <p className="text-sm text-red-500">{errors.api_key_secret}</p>}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Conectando..." : "Conectar con WooCommerce"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
