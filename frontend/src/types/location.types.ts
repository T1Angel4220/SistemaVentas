/**
 * Tipos e interfaces relacionados con ubicaciones
 */

export interface Location {
  id: number;
  nombre: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
}

export interface LocationsResponse {
  success: boolean;
  data: Location[];
}
