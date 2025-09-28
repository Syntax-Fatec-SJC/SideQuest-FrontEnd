import { useEffect, useState } from "react";
import { FaFolderPlus, FaFolder, FaTrash, FaSyncAlt } from "react-icons/fa";
import CriarProjetoModal from "../components/CriarProjetoModal";
import Sidebar from "../components/Sidebar";
import ApiService from "../services/ApiService";

// Modelo alinhado ao backend
interface Projeto {
  id: string;
  nome: string;
  status: string;
  usuarioIds: string[];
}

export default function GerenciarProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const usuarioLogadoId = ((): string | null => {
    const rawNovo = localStorage.getItem("usuarioLogado");
    if (rawNovo) {
      try { return JSON.parse(rawNovo).id; } catch {}
    }
    const rawAntigo = localStorage.getItem("usuario");
    if (rawAntigo) {
      try { return JSON.parse(rawAntigo).id; } catch {}
    }
    const idIsolado = localStorage.getItem("usuarioId");
    return idIsolado;
  })();

  useEffect(() => {
    carregarProjetos();
  }, [usuarioLogadoId]);

  async function carregarProjetos() {
    if (!usuarioLogadoId) {
      setTimeout(() => { window.location.href = '/acesso'; }, 1500);
      setErro("Usuário não identificado. Redirecionando para login...");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const lista: Projeto[] = await (ApiService as any).listarProjetosDoUsuario(usuarioLogadoId);
      setProjetos(lista);
      if (lista.length > 0 && !projetoSelecionadoId) {
        const salvo = localStorage.getItem("projetoSelecionadoId");
        if (salvo && lista.some(p => p.id === salvo)) {
          setProjetoSelecionadoId(salvo);
        } else {
          setProjetoSelecionadoId(lista[0].id);
          localStorage.setItem("projetoSelecionadoId", lista[0].id);
        }
      }
    } catch (e: any) {
      setErro(e.message || "Falha ao carregar projetos");
    } finally {
      setLoading(false);
    }
  }

  async function criarProjeto(nome: string) {
    if (!usuarioLogadoId) return;
    if (!nome.trim()) return;
    setCreating(true);
    try {
      const novo: Projeto = await (ApiService as any).criarProjeto(usuarioLogadoId, nome.trim());
      setProjetos(prev => [...prev, novo]);
      setProjetoSelecionadoId(novo.id);
      localStorage.setItem("projetoSelecionadoId", novo.id);
      setShowModal(false);
    } catch (e: any) {
      alert(e.message || "Erro ao criar projeto");
    } finally {
      setCreating(false);
    }
  }

  async function excluirProjeto(id: string, ev?: React.MouseEvent) {
    if (ev) ev.stopPropagation();
    if (!window.confirm("Excluir este projeto?")) return;
    setRemovendoId(id);
    try {
      await (ApiService as any).excluirProjeto(id);
      setProjetos(prev => prev.filter(p => p.id !== id));
      if (projetoSelecionadoId === id) {
        setProjetoSelecionadoId(null);
        localStorage.removeItem("projetoSelecionadoId");
      }
    } catch (e: any) {
      alert(e.message || "Erro ao excluir");
    } finally {
      setRemovendoId(null);
    }
  }

  function selecionar(id: string) {
    setProjetoSelecionadoId(id);
    localStorage.setItem("projetoSelecionadoId", id);
  }

  const estadoPrincipal = (() => {
    if (loading) {
      return (
        <div className="col-span-full text-center text-cinza-claro flex flex-col items-center gap-4 py-16">
          <FaSyncAlt className="animate-spin text-3xl" />
          <span>Carregando projetos...</span>
        </div>
      );
    }
    if (erro) {
      return (
        <div className="col-span-full text-center text-red-600 flex flex-col gap-4 py-16">
            <span>{erro}</span>
            <button onClick={carregarProjetos} className="px-4 py-2 bg-azul-escuro text-white rounded hover:bg-azul-claro transition">Tentar novamente</button>
        </div>
      );
    }
    if (!projetos.length) {
      return (
        <div className="col-span-full text-center text-cinza-claro flex flex-col gap-4 py-16">
          <span>Nenhum projeto ainda. Crie o primeiro!</span>
        </div>
      );
    }
    return projetos.map((projeto) => {
      const selecionado = projetoSelecionadoId === projeto.id;
      return (
        <div
          key={projeto.id}
          onClick={() => selecionar(projeto.id)}
          className={`group relative cursor-pointer w-full h-44 sm:h-52 rounded-lg flex flex-col items-center justify-center p-4 sm:p-6 bg-pastel shadow-md transition border-2 ${selecionado ? 'border-azul-escuro ring-2 ring-azul-escuro/40' : 'border-transparent hover:shadow-lg'}`}
        >
          <button
            onClick={(e) => excluirProjeto(projeto.id, e)}
            disabled={removendoId === projeto.id}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-red-600 hover:text-red-700 bg-white/70 rounded px-2 py-1 text-xs"
          >
            {removendoId === projeto.id ? '...' : <FaTrash />}
          </button>
          <FaFolder className="text-cinza-medio text-6xl sm:text-8xl mb-2 sm:mb-3" />
          <span className="text-base sm:text-lg text-cinza-claro font-bold text-center line-clamp-2">
            {projeto.nome}
          </span>
          <span className="mt-1 text-xs uppercase tracking-wide text-cinza-medio">{projeto.status}</span>
        </div>
      );
    });
  })();

return (
    <div className="flex h-screen relative">
      <Sidebar />
      <div className="flex-1 bg-white rounded-3xl overflow-auto p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 text-center text-azul-escuro">Gerenciar Projetos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-[1100px]">
          {estadoPrincipal}
          {!loading && !erro && (
            <>
              <button
                onClick={() => setShowModal(true)}
                disabled={creating}
                className="w-full h-44 sm:h-52 rounded-lg flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-cinza-claro text-cinza-claro bg-white hover:bg-pastel hover:text-cinza-medio transition disabled:opacity-50"
              >
                <FaFolderPlus className="text-6xl sm:text-8xl mb-2 sm:mb-3" />
                <span className="text-base sm:text-lg">{creating ? 'Criando...' : 'Novo Projeto'}</span>
              </button>
              <CriarProjetoModal
                isOpen={showModal}
                onClose={() => !creating && setShowModal(false)}
                onCreate={criarProjeto}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
