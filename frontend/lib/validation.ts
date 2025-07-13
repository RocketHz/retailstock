// Form validation utilities
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra mayúscula")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra minúscula")
  }

  if (!/\d/.test(password)) {
    errors.push("La contraseña debe contener al menos un número")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("La contraseña debe contener al menos un carácter especial")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateRegistrationForm(data: {
  email: string
  password: string
  confirmPassword: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.email) {
    errors.email = "El correo electrónico es obligatorio"
  } else if (!validateEmail(data.email)) {
    errors.email = "Por favor, ingresa un correo electrónico válido"
  }

  if (!data.password) {
    errors.password = "La contraseña es obligatoria"
  } else {
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0]
    }
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Por favor, confirma tu contraseña"
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
