

export default function Spinner({ text = "CHARGEMENT..." }) {
  return (
    <div className="min-h-screen bg-[#001E2B] flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-[#1C2D38] border-t-[#00ED64] rounded-full animate-spin mb-4" />
      <p className="text-slate-400 font-mono text-sm tracking-wider">{text}</p>
    </div>
  );
}