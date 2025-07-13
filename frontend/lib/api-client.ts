// Cliente API con interceptores para autenticación y manejo de errores
import { toast } from "@/components/ui/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Interfaz para opciones de solicitud, incluyendo parámetros de consulta y datos de cuerpo
interface RequestOptions extends RequestInit {
  params?: Record<string, any>; // Para solicitudes GET (serán parte de la URL)
  data?: any; // Para solicitudes POST/PUT/PATCH (serán el cuerpo de la solicitud)
}

// Función auxiliar para construir la URL con parámetros de consulta
const buildUrl = (endpoint: string, params?: Record<string, any>) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach(key => {
      // Solo añade el parámetro si tiene un valor definido
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
  }
  return url.toString();
};

// Función principal para realizar la solicitud HTTP
const makeRequest = async (method: string, endpoint: string, options: RequestOptions = {}) => {
  const token = localStorage.getItem("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json", // Por defecto, enviamos y esperamos JSON
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers, // Permite sobrescribir encabezados
  };

  const config: RequestInit = {
    method,
    headers,
    ...options, // Permite sobrescribir otras opciones de RequestInit
  };

  // Para métodos que envían un cuerpo, serializa los datos a JSON
  if (options.data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(options.data);
  }

  try {
    // Construye la URL final, incluyendo los parámetros de consulta si es GET
    const url = buildUrl(endpoint, options.params);
    const response = await fetch(url, config);

    if (!response.ok) {
      // Manejo de errores HTTP
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
        window.location.href = "/login";
      } else if (response.status === 500) {
        toast({
          title: "Error del servidor",
          description: "Ha ocurrido un error en el servidor. Por favor, inténtalo más tarde.",
          variant: "destructive",
        });
      } else {
        // Intenta parsear el error JSON si está disponible
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        toast({
          title: "Error",
          description: errorData.message || "Ha ocurrido un error al procesar tu solicitud.",
          variant: "destructive",
        });
      }
      throw new Error(response.statusText);
    }

    // Si la respuesta es 204 No Content, no hay cuerpo JSON que parsear
    if (response.status === 204) {
      return { data: null, status: response.status, headers: response.headers };
    }

    // Intenta parsear la respuesta como JSON
    const data = await response.json().catch(() => {
      // Si falla el parseo JSON, pero la respuesta fue OK, devuelve null o maneja según necesites
      console.warn('Received non-JSON response for OK status:', url);
      return null;
    });

    // Devuelve un objeto con los datos, el estado y los encabezados
    return { data, status: response.status, headers: response.headers };

  } catch (error: any) {
    // Manejo de errores de red o errores lanzados por el fetch
    if (error.message === "Failed to fetch") {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al procesar tu solicitud.",
        variant: "destructive",
      });
    }
    throw error;
  }
};

// Exporta un objeto con métodos para cada verbo HTTP
const apiClient = {
  get: (endpoint: string, options?: Omit<RequestOptions, 'method' | 'body' | 'data'>) =>
    makeRequest('GET', endpoint, options),
  post: (endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body' | 'params' | 'data'>) =>
    makeRequest('POST', endpoint, { ...options, data }),
  put: (endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body' | 'params' | 'data'>) =>
    makeRequest('PUT', endpoint, { ...options, data }),
  delete: (endpoint: string, options?: Omit<RequestOptions, 'method' | 'body' | 'params' | 'data'>) =>
    makeRequest('DELETE', endpoint, options),
  patch: (endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body' | 'params' | 'data'>) =>
    makeRequest('PATCH', endpoint, { ...options, data }),
};

export default apiClient;
