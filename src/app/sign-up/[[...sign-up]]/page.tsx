import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <SignUp
          forceRedirectUrl="/organization"
          fallbackRedirectUrl="/organization"
          signInUrl="/sign-in"
        />
      </div>
    </main>
  );
}