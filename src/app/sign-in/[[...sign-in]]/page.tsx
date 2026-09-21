import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <SignIn
          forceRedirectUrl="/organization"
          signUpForceRedirectUrl="/organization"
          signUpUrl="/sign-up"
        />
      </div>
    </main>
  );
}