export interface PublicUser {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  role: string;
  specialty?: string | null;
  color?: string | null;
  initials?: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResult extends TokenPair {
  user: PublicUser;
}
