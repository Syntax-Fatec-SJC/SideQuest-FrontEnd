import { useState, useEffect } from 'react';
import Sidebar from '../../shared/components/Sidebar';
import { MdOutlineAccessTime, MdOutlineArrowForward, MdOutlineErrorOutline } from 'react-icons/md';
import { PiSealCheckFill } from 'react-icons/pi';

interface Aviso {
  id: number;
  tipo: 'urgente' | 'edicao' | 'novo';
  mensagem: string;
  data: string;
  visualizado: boolean;
}

export default function Avisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarAvisos = async () => {
      const dados: Aviso[] = [
        { id: 1, tipo: 'urgente', mensagem: 'Uma tarefa atrelada a você está para vencer. Conclua ela o quanto antes!', data: '2025-10-21', visualizado: false },
        { id: 2, tipo: 'edicao', mensagem: 'Fulano editou uma tarefa atrelada a você.', data: '2025-10-20', visualizado: true },
        { id: 3, tipo: 'novo', mensagem: 'Uma tarefa foi atrelada a você. Confira agora!', data: '2025-10-19', visualizado: false },
        { id: 4, tipo: 'urgente', mensagem: 'Uma tarefa atrelada a você está para vencer. Conclua ela o quanto antes!', data: '2025-10-18', visualizado: false },
        { id: 5, tipo: 'edicao', mensagem: 'Fulano anexou um arquivo em uma tarefa atrelada a você.', data: '2025-10-18', visualizado: true },
        { id: 6, tipo: 'novo', mensagem: 'Uma tarefa foi atrelada a você. Confira agora!', data: '2025-10-17', visualizado: true },
      ];

      setTimeout(() => {
        setAvisos(dados);
        setCarregando(false);
      }, 400);
    };

    void carregarAvisos();
  }, []);

  const cores = {
    urgente: 'bg-red-100 border-red-300 text-red-800',
    edicao: 'bg-orange-100 border-orange-300 text-orange-800',
    novo: 'bg-green-100 border-green-300 text-green-800',
  };

  const icones = {
    urgente: <MdOutlineAccessTime size={24} />,
    edicao: <MdOutlineErrorOutline size={24} />,
    novo: <PiSealCheckFill size={24} />,
  };

  const marcarComoLido = (id: number) => {
    setAvisos(prev =>
      prev.map(aviso =>
        aviso.id === id ? { ...aviso, visualizado: true } : aviso
      )
    );
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-white rounded-3xl p-8 shadow-lg mt-8 mb-8 mx-4 overflow-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-azul-escuro">
          AVISOS
        </h1>

        {carregando ? (
          <div className="text-center text-gray-500 mt-10">Carregando avisos...</div>
        ) : avisos.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">Nenhum aviso encontrado.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {avisos.map(aviso => (
              <div
                key={aviso.id}
                onClick={() => marcarComoLido(aviso.id)}
                className={`relative flex items-center justify-between gap-4 p-4 rounded-lg border shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${cores[aviso.tipo]}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center text-2xl">
                    {icones[aviso.tipo]}
                  </div>

                  <div className="flex flex-col">
                    <p className="font-medium">{aviso.mensagem}</p>
                    <span className="text-xs text-gray-500">{aviso.data}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!aviso.visualizado && (
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                  <MdOutlineArrowForward size={22} className="text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
