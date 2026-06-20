import { Link } from "react-router-dom";

function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] p-6 dark:bg-[#0F0F13]">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          You do not have permission to access this resource.
        </p>
        <Link to="/" className="mt-4 inline-flex rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white">
          Back Home
        </Link>
      </div>
    </div>
  );
}

export default AccessDenied;

