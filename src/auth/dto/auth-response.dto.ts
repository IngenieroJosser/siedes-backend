import { Dto } from "src/lib/dto/dto";

export interface AuthResponse extends Dto<AuthResponse> {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token?: string;
  };
  error?: string;
}

export interface ValidationResult extends Dto<ValidationResult> {
  isValid: boolean;
  errors: string[];
}

export interface AvailabilityResponse extends Dto<AvailabilityResponse> {
  available: boolean;
}