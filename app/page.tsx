// sellify/app/page.tsx
// Root redirect is now handled in middleware.ts for better reliability
// This page should not normally render, but serves as a fallback
export default function Home() {
  return null;
}