import { auth } from "@clerk/nextjs/server";

// Agar aapko server components ya API routes mein current user ki ID ya details chahiye
export async function getCurrentUser() {
  const { userId } = await auth();
  return { userId };
}