import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-950">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">hostel/app</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-slate-500">
        This is the private owner workspace. Use the dashboard home to continue.
      </p>
      <Link
        href="/hotel-app"
        className="mt-8 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Go to hotel app
      </Link>
    </main>
  );
}
