
import { FaGoogle } from "react-icons/fa";

function BotaoGoogle() {
  return (
    <button className="w-full flex items-center justify-center gap-2 py-4 mb-4 border border-gray-300 rounded-lg hover:bg-gray-600 bg-red-500 transition">
      <FaGoogle className="text-white" size={16} />
      <span className="text-white font-medium">Criar com Google</span>
    </button>
  );
}

export default BotaoGoogle;