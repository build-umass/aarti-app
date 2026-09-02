import SignInForm from '@/components/SignInForm';

export default function SignInPage() {
  return (
    <div className="atmosphere grain relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="rise relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground font-display text-2xl font-semibold text-primary shadow-lg">
            A
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-primary-foreground">
            Aarti Admin
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Content management for the Aarti learning app
          </p>
        </div>

        <div className="rise rise-2 rounded-2xl border border-border/60 bg-card/95 p-7 shadow-2xl shadow-primary/30 backdrop-blur">
          <SignInForm />
        </div>

        <p className="mt-6 text-center text-xs text-primary-foreground/50">
          Access is limited to content administrators.
        </p>
      </div>
    </div>
  );
}
