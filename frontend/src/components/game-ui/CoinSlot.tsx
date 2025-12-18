export default function CoinSlot({ coins }: { coins: number }) {
  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 border-2 border-yellow-500">
      <span className="text-2xl">💰</span>
      <span className="text-yellow-400 font-bold text-lg">{coins}</span>
    </div>
  );
}


