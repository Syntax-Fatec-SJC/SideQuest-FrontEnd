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

    const projetoSelecionadoId = typeof window !== 'undefined' ? localStorage.getItem('projetoSelecionadoId') : null;

    const carregar = useCallback(async () => {
        if (!projetoSelecionadoId) { setLoadingLista(false); return; }
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

    useEffect(() => { void carregar(); }, [carregar]);
    useEffect(() => { if (toast) { const t=setTimeout(()=>setToast(null),2500); return ()=>clearTimeout(t);} }, [toast]);

    const membrosIds = new Set(membros.map(m=>m.usuarioId));
    const usuariosDisponiveis = usuarios.filter(u => !membrosIds.has(u.id));

    const iniciarAdicao = () => {
        if (!projetoSelecionadoId) { setToast({ tipo:'erro', mensagem:'Selecione um projeto primeiro'}); return; }
        if (linhaEdicao) { setToast({ tipo:'info', mensagem:'Já existe uma linha em edição'}); return; }
        setLinhaEdicao({ nome:'', email:'', usuarioIdSelecionado: undefined });
    };

    const cancelarEdicao = () => setLinhaEdicao(null);

    const salvarLinha = async () => {
        if (!projetoSelecionadoId || !linhaEdicao) return;
        setLoadingAcao(true);
        try {
            if (!linhaEdicao.usuarioIdSelecionado) {
                setLinhaEdicao(prev => prev ? { ...prev, erro: 'Selecione um usuário existente'} : prev);
                setLoadingAcao(false);
                return;
            }
            await membrosService.adicionarMembroProjeto(projetoSelecionadoId, linhaEdicao.usuarioIdSelecionado);
            const atualizados = await membrosService.listarMembrosProjeto(projetoSelecionadoId);
            setMembros(atualizados);
            setLinhaEdicao(null);
            setToast({ tipo:'sucesso', mensagem:'Membro adicionado' });
        } catch (e: unknown) {
            const mensagem = e instanceof Error ? e.message : String(e);
            setToast({ tipo:'erro', mensagem: mensagem || 'Erro ao adicionar'});
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
            setToast({ tipo:'info', mensagem:'Membro removido'});
        } catch (e: unknown) {
            const mensagem = e instanceof Error ? e.message : String(e);
            setToast({ tipo:'erro', mensagem: mensagem || 'Erro ao remover'});
        } finally {
            setLoadingAcao(false);
            setConfirmandoRemocaoId(null);
        }
    };

    const filtered = membros.filter(m => [m.nome,m.email].some(v=>v.toLowerCase().includes(busca.toLowerCase())));

    return (
        <div className="flex h-screen relative">
            <Sidebar />
            <main className="flex-1 bg-white rounded-3xl overflow-auto p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-azul-escuro">MEMBROS DO PROJETO</h1>

                {!projetoSelecionadoId && (
                    <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-900 rounded mb-4">Selecione um projeto na página de Projetos.</div>
                )}

                <div className="flex justify-between mb-6">
                    <input
                        placeholder="Pesquisar..."
                        className="p-2 w-64 rounded-md border border-gray-300"
                        value={busca}
                        onChange={e=>setBusca(e.target.value)}
                    />
                    <button
                        onClick={iniciarAdicao}
                        disabled={!projetoSelecionadoId || !!linhaEdicao || loadingLista}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >+ Novo Membro</button>
                </div>

    {linhaEdicao && (
        <div className="bg-[#F5F5F5] rounded-lg shadow p-4 mb-4 flex flex-col gap-2">
            <div className="flex flex-col md:flex-row gap-2">
                <select
                    className="p-2 border rounded flex-1"
                    value={linhaEdicao.usuarioIdSelecionado || ''}
                    onChange={e => {
                        const id = e.target.value || undefined;
                        const user = usuarios.find(u => u.id === id);
                        setLinhaEdicao((prev: LinhaEdicao | null) =>
                            prev
                                ? {
                                    ...prev,
                                    usuarioIdSelecionado: id,
                                    nome: user?.nome || '',
                                    email: user?.email || '',
                                    erro: undefined,
                                }
                                : prev
                        );
                    }}
                >
                    <option value="">Selecione um usuário...</option>
                    {usuariosDisponiveis.map(u => (
                        <option key={u.id} value={u.id}>
                            {u.nome} - {u.email}
                        </option>
                    ))}
                </select>
            </div>

            {linhaEdicao.erro && <div className="text-sm text-red-600">{linhaEdicao.erro}</div>}

            <div className="flex gap-2 justify-end">
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


                {loadingLista ? (
                    <div className="text-center text-gray-500">Carregando...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-gray-500">Nenhum membro.</div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(m => (
                            <div key={m.usuarioId} className="bg-[#F5F5F5] rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div className="flex flex-col">
                                    <span className="font-semibold flex items-center gap-2">{m.nome}{m.criador && <span className="text-xs bg-indigo-600 text-white px-2 py-[2px] rounded-full">Criador</span>}</span>
                                    <span className="text-sm text-gray-600">{m.email}</span>
                                </div>
                                {!m.criador && (
                                    confirmandoRemocaoId === m.usuarioId ? (
                                        <div className="flex gap-2 items-center">
                                            <button
                                                disabled={loadingAcao}
                                                onClick={()=>remover(m.usuarioId)}
                                                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                                            >Confirmar</button>
                                            <button
                                                disabled={loadingAcao}
                                                onClick={()=>setConfirmandoRemocaoId(null)}
                                                className="px-3 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-sm disabled:opacity-50"
                                            >Cancelar</button>
                                        </div>
                                    ) : (
                                        <button
                                            disabled={loadingAcao}
                                            onClick={()=>setConfirmandoRemocaoId(m.usuarioId)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                                        >Excluir</button>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {toast && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white text-sm ${toast.tipo==='erro'?'bg-red-600':toast.tipo==='sucesso'?'bg-green-600':'bg-blue-600'}`}>{toast.mensagem}</div>
                )}
            </main>
            <style>{`.custom-scrollbar{scrollbar-width:none;-ms-overflow-style:none}.custom-scrollbar::-webkit-scrollbar{display:none}`}</style>
        </div>
    );
}
