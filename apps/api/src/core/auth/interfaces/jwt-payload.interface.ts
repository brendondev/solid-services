/**
 * Payload do JWT token
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  tenantId: string;
  roles: string[];
  iat?: number;
  exp?: number;
}
