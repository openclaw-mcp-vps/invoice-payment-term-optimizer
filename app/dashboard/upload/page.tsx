import { UploadZone } from "@/components/upload-zone";

export default function UploadPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Upload Invoices</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Upload a historical invoice CSV and the app will parse each client record, analyze payment behavior, and
          generate term optimization recommendations.
        </p>
      </div>
      <UploadZone />
    </section>
  );
}
