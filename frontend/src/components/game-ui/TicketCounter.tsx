export default function TicketCounter({ tickets }: { tickets: number }) {
  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 border-2 border-blue-500">
      <span className="text-2xl">🎫</span>
      <span className="text-blue-400 font-bold text-lg">{tickets}</span>
    </div>
  );
}


