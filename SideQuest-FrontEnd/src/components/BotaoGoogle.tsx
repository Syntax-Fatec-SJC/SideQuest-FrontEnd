
import { FaGoogle } from "react-icons/fa";

interface BotaoGoogleProps {
  className?: string;
  texto?: string;
}

const BotaoGoogle: React.FC<BotaoGoogleProps> = ({ className = "w-full flex items-center justify-center gap-2 py-4 mb-4 border border-gray-300 rounded-lg hover:bg-gray-600 bg-red-500 transition", texto = "" }) => {
  return (
    <button className={className}>
      <FaGoogle className="text-white" size={16} />
      <span className="text-white font-medium">{texto}</span>
    </button>
  );
};

export default BotaoGoogle;