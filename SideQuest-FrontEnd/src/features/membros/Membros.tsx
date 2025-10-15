import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../shared/components/Sidebar';
import { membrosService } from '../../services/MembrosService';
import { usuarioService } from '../../services/AuthService';
import type { LinhaEdicao, Toast, MembroProjeto, UsuarioResumo } from '../../types/Membro';

export default function Membros() {
    const [membros, setMembros] = useState<MembroProjeto[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioResumo[]>([]);
    const [linhaEdicao, setLinhaEdicao] = useState<LinhaEdicao | null>(null);
    const [loadingLista, setLoadingLista] = useState(true);
    const [loadingAcao, setLoadingAcao] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const [busca, setBusca] = useState('');
    const [confirmandoRemocaoId, setConfirmandoRemocaoId] = useState<string | null>(null);
    const [listaAberta, setListaAberta] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [membrosPorPagina, setMembrosPorPagina] = useState(8);

    const projetoSelecionadoId =
        typeof window !== 'undefined' ? localStorage.getItem('projetoSelecionadoId') : null;

    // 🔹 Ajuste automático da quantidade de membros por página conforme altura da tela
    useEffect(() => {
        const calcularMembrosPorPagina = () => {
            const altura = window.innerHeight;
            // define quantos cards cabem de forma proporcional
            const estimado = Math.floor((altura - 300) / 80); 
            setMembrosPorPagina(Math.max(3, estimado)); // mínimo 3 por segurança
        };
        calcularMembrosPorPagina();
        window.addEventListener('resize', calcularMembrosPorPagina);
        return () => window.removeEventListener('resize', calcularMembrosPorPagina);
    }, []);

    const carregar = useCallback(async () => {
        if (!projetoSelecionadoId) {
            setLoadingLista(false);
            return;
        }
        setLoadingLista(true);
        try {
            const [membrosResp, usuariosResp] = await Promise.all([
                membrosService.listarMembrosProjeto(projetoSelecionadoId),
                usuarioService.listarUsuarios()
            ]);
            setMembros(membrosResp);
            setUsuarios(usuariosResp);
        } catch (e: unknown) {
            const mensagem = e instanceof Error ? e.message : String(e);
            setToast({ tipo: 'erro', mensagem: mensagem || 'Falha ao carregar' });
        } finally {
            setLoadingLista(false);
        }
    }, [projetoSelecionadoId]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const membrosIds = new Set(membros.map(m => m.usuarioId));
    const usuariosDisponiveis = usuarios.filter(u => !membrosIds.has(u.id));

    const iniciarAdicao = () => {
        if (!projetoSelecionadoId) {
            setToast({ tipo: 'erro', mensagem: 'Selecione um projeto primeiro' });
            return;
        }
        if (linhaEdicao) {
            setToast({ tipo: 'info', mensagem: 'Já existe uma linha em edição' });
            return;
        }
        setLinhaEdicao({ nome: '', email: '', usuarioIdSelecionado: undefined });
        setListaAberta(true);
    };

    const cancelarEdicao = () => setLinhaEdicao(null);

    const salvarLinha = async () => {
        if (!projetoSelecionadoId || !linhaEdicao) return;
        setLoadingAcao(true);
        try {
            if (!linhaEdicao.usuarioIdSelecionado) {
                setLinhaEdicao(prev =>
                    prev ? { ...prev, erro: 'Selecione um usuário existente' } : prev
                );
                setLoadingAcao(false);
                return;
            }
            await membrosService.adicionarMembroProjeto(
                projetoSelecionadoId,
                linhaEdicao.usuarioIdSelecionado
            );
            const atualizados = await membrosService.listarMembrosProjeto(projetoSelecionadoId);
            setMembros(atualizados);
            setLinhaEdicao(null);
            setToast({ tipo: 'sucesso', mensagem: 'Membro adicionado' });
        } catch (e: unknown) {
            const mensagem = e instanceof Error ? e.message : String(e);
            setToast({ tipo: 'erro', mensagem: mensagem || 'Erro ao adicionar' });
        } finally {
            setLoadingAcao(false);
        }
    };

    const remover = async (usuarioId: string) => {
        if (!projetoSelecionadoId) return;
        setLoadingAcao(true);
        try {
            await membrosService.removerMembroProjeto(projetoSelecionadoId, usuarioId);
            const atualizados = await membrosService.listarMembrosProjeto(projetoSelecionadoId);
            setMembros(atualizados);
            setToast({ tipo: 'info', mensagem: 'Membro removido' });
        } catch (e: unknown) {
            const mensagem = e instanceof Error ? e.message : String(e);
            setToast({ tipo: 'erro', mensagem: mensagem || 'Erro ao remover' });
        } finally {
            setLoadingAcao(false);
            setConfirmandoRemocaoId(null);
        }
    };

    const filtered = membros.filter(m =>
        [m.nome, m.email].some(v => v.toLowerCase().includes(busca.toLowerCase()))
    );

    const indexUltimo = paginaAtual * membrosPorPagina;
    const indexPrimeiro = indexUltimo - membrosPorPagina;
    const membrosPagina = filtered.slice(indexPrimeiro, indexUltimo);
    const totalPaginas = Math.ceil(filtered.length / membrosPorPagina);

    return (
        <div className="flex h-screen relative overflow-hidden">
            <Sidebar />
            <main className="flex-1 bg-white rounded-3xl p-8 shadow-lg mt-8 mb-8 mx-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-azul-escuro">
                    MEMBROS DO PROJETO
                </h1>

                {!projetoSelecionadoId && (
                    <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-900 rounded mb-4">
                        Selecione um projeto na página de Projetos.
                    </div>
                )}

                <div className="flex justify-between mb-6">
                    <input
                        placeholder="Pesquisar..."
                        className="p-2 w-64 rounded-md border border-gray-300"
                        value={busca}
                        onChange={e => {
                            setBusca(e.target.value);
                            setPaginaAtual(1);
                        }}
                    />
                    <button
                        onClick={iniciarAdicao}
                        disabled={!projetoSelecionadoId || !!linhaEdicao || loadingLista}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        + Novo Membro
                    </button>
                </div>

                {/* Linha de adição */}
                {linhaEdicao && (
                    <div className="bg-[#F5F5F5] rounded-lg shadow p-4 mb-4 flex flex-col gap-2 relative">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Pesquisar usuário..."
                                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                value={linhaEdicao?.nome || ''}
                                onChange={e => {
                                    const valor = e.target.value;
                                    setLinhaEdicao(prev =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  nome: valor,
                                                  usuarioIdSelecionado: undefined,
                                                  erro: undefined
                                              }
                                            : prev
                                    );
                                    setListaAberta(true);
                                }}
                                onFocus={() => setListaAberta(true)}
                            />

                            {listaAberta && usuariosDisponiveis.length > 0 && (
                                <ul className="absolute top-full left-0 z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {usuariosDisponiveis
                                        .filter(
                                            u =>
                                                u.nome
                                                    .toLowerCase()
                                                    .includes(
                                                        (linhaEdicao.nome || '').toLowerCase()
                                                    ) ||
                                                u.email
                                                    .toLowerCase()
                                                    .includes(
                                                        (linhaEdicao.nome || '').toLowerCase()
                                                    )
                                        )
                                        .map(u => (
                                            <li
                                                key={u.id}
                                                className="p-2 hover:bg-blue-100 cursor-pointer"
                                                onClick={() => {
                                                    setLinhaEdicao(prev =>
                                                        prev
                                                            ? {
                                                                  ...prev,
                                                                  usuarioIdSelecionado: u.id,
                                                                  nome: u.nome,
                                                                  email: u.email,
                                                                  erro: undefined
                                                              }
                                                            : prev
                                                    );
                                                    setListaAberta(false);
                                                }}
                                            >
                                                {u.nome} - {u.email}
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>

                        {linhaEdicao.erro && (
                            <div className="text-sm text-red-600">{linhaEdicao.erro}</div>
                        )}

                        <div className="flex gap-2 justify-end mt-2">
                            <button
                                onClick={cancelarEdicao}
                                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={loadingAcao}
                                onClick={salvarLinha}
                                className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-sm"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de membros */}
                {loadingLista ? (
                    <div className="text-center text-gray-500">Carregando...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-gray-500">Nenhum membro.</div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {membrosPagina.map(m => (
                                <div
                                    key={m.usuarioId}
                                    className="bg-[#F5F5F5] rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold flex items-center gap-2">
                                            {m.nome}
                                            {m.criador && (
                                                <span className="text-xs bg-indigo-600 text-white px-2 py-[2px] rounded-full">
                                                    Criador
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-sm text-gray-600">{m.email}</span>
                                    </div>
                                    {!m.criador && (
                                        confirmandoRemocaoId === m.usuarioId ? (
                                            <div className="flex gap-2 items-center">
                                                <button
                                                    disabled={loadingAcao}
                                                    onClick={() => remover(m.usuarioId)}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                                                >
                                                    Excluir
                                                </button>
                                                <button
                                                    disabled={loadingAcao}
                                                    onClick={() => setConfirmandoRemocaoId(null)}
                                                    className="px-3 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-sm disabled:opacity-50"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                disabled={loadingAcao}
                                                onClick={() => setConfirmandoRemocaoId(m.usuarioId)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                                            >
                                                Excluir
                                            </button>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Paginação */}
                        {totalPaginas > 1 && (
                            <div className="flex justify-center mt-4 gap-2">
                                <button
                                    onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                                    disabled={paginaAtual === 1}
                                    className="px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    ‹
                                </button>

                                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setPaginaAtual(num)}
                                        className={`px-3 py-1 rounded-md transition-colors ${
                                            paginaAtual === num
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button
                                    onClick={() =>
                                        setPaginaAtual(prev =>
                                            Math.min(prev + 1, totalPaginas)
                                        )
                                    }
                                    disabled={paginaAtual === totalPaginas}
                                    className="px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Toast */}
                {toast && (
                    <div
                        className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white text-sm ${
                            toast.mensagem === 'Membro removido'
                                ? 'bg-red-600'
                                : toast.tipo === 'erro'
                                ? 'bg-orange-500'
                                : toast.tipo === 'sucesso'
                                ? 'bg-green-600'
                                : 'bg-blue-600'
                        }`}
                    >
                        {toast.mensagem}
                    </div>
                )}
            </main>
        </div>
    );
}
