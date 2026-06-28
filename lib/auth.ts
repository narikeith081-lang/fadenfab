import { verify } from "jsonwebtoken";

export function verifyToken(token: string) {
  try {
    return verify(
      token,
      process.env.JWT_SECRET!
    );
  } catch {
    return null;
  }
}