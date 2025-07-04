import { mockUsers, MockUser } from "./mockUsers";
import { NextRequest } from "next/server";

export function getAuthenticatedUser(req: NextRequest): MockUser | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1]; 
  return mockUsers[token] ?? null;
}
