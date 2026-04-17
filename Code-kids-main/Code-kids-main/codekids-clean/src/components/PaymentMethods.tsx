import type { Settings } from "@/lib/firebase";

interface PaymentMethodsProps {
  settings: Settings;
  compact?: boolean;
}

export function PaymentMethods({ settings, compact = false }: PaymentMethodsProps) {
  const methods = [
    { key: "paypal", label: "PayPal", url: settings.paypalUrl, qr: settings.paypalQrUrl },
    { key: "venmo", label: "Zelle", url: settings.venmoUrl, qr: settings.venmoQrUrl }
  ].filter((item) => item.url || item.qr);

  if (!methods.length) return null;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${compact ? "" : "mt-3.5"}`}>
      {methods.map((method) => (
        <div key={method.key} className="border border-slate-200 rounded-2xl p-4 bg-white">
          <div className="flex justify-between items-center gap-2.5 mb-3">
            <div className="font-bold text-slate-900">{method.label}</div>
            {method.url && (
              <a
                className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full"
                href={method.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </a>
            )}
          </div>
          {method.qr ? (
            <img
              src={method.qr}
              alt={`${method.label} QR code`}
              className="w-full aspect-square object-cover rounded-xl border border-slate-200"
            />
          ) : (
            <div className="w-full aspect-square rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-sm">
              {method.label} QR code
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
