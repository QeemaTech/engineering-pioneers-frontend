import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { useCreateStudentByAdmin } from "../../features/admin/users/hooks";
import { getErrorMessage } from "../../api/error";

function AddStudent() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useCreateStudentByAdmin();
  const onSubmit = () => {
    mutation.mutate({
      fullName,
      email,
      phone: phone || undefined,
      password,
      confirmPassword: password,
    });
  };

  return (
    <section className="space-y-6">
      <PageHeader title="Add Student" subtitle="Create a new student account" />
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="grid gap-4 md:grid-cols-2">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
        </div>
        {mutation.isError ? <p className="mt-3 text-sm text-red-600 dark:text-red-300">{getErrorMessage(mutation.error, "Failed to create student.")}</p> : null}
        {mutation.isSuccess ? <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">Student created successfully.</p> : null}
        <button onClick={onSubmit} className="mt-4 rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white">{mutation.isPending ? "Creating..." : "Create Student"}</button>
      </div>
    </section>
  );
}

export default AddStudent;

