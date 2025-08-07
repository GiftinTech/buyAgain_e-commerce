// Custom type for token payload from JWT
export interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}
