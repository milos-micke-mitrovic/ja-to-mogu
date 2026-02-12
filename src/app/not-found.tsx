/* eslint-disable @next/next/no-html-link-for-pages */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-xl text-foreground-muted">Stranica nije pronađena</p>
      <p className="mt-2 text-foreground-muted">
        Stranica koju tražite ne postoji ili je premeštena.
      </p>
      <a
        href="/"
        className="mt-8 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary-hover"
      >
        Nazad na početnu
      </a>
    </div>
  );
}
