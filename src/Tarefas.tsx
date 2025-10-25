import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { FaCalendarAlt, FaRegUserCircle, FaTrash } from "react-icons/fa";
import ModalTarefa from "./components/Modal";
import ApiService from "./services/ApiService";
import axios from "axios";

type Status = "Pendente" | "Desenvolvimento" | "Concluído"

interface Tarefa {
    id: string;
    nome: string;
    status: string;
    descricao: string;
    comentario?: string;
    prazoFinal?: string;
    projetoId?: string;
    anexo?: string[];
    usuarioIds?: string[];
}

interface MembroProjeto {
    usuarioId: string;
    nome: string;
    email: string;
    criador: boolean;
}

const API_BASE_URL = 'http://localhost:8080';

export default function Tarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [projetoId, setProjetoId] = useState<string | null>(() => localStorage.getItem('projetoSelecionadoId'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editarTarefa, setEditarTarefa] = useState<Tarefa | null>(null);
    const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [membros, setMembros] = useState<MembroProjeto[]>([]);

    // Efeito para escutar mudanças no localStorage para o projeto selecionado
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === 'projetoSelecionadoId') {
                const novo = localStorage.getItem('projetoSelecionadoId');
                setProjetoId(novo);
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    // Efeito para carregar tarefas e membros quando o projetoId muda
    useEffect(() => {
        if (projetoId) {
            carregarTarefas(projetoId);
            carregarMembros(projetoId);
        } else {
            setTarefas([]);
            setMembros([]);
            console.log('ℹ️ [TAREFAS] Nenhum projeto selecionado. Limpando tarefas e membros.');
        }
    }, [projetoId]);

    // Função para carregar tarefas do projeto
    async function carregarTarefas(pid: string) {
        setLoading(true);
        setError(null);
        try {
            console.log(`⏳ [TAREFAS] Carregando tarefas para o projeto ID: ${pid}`);
            const data = await ApiService.listarTarefasDoProjeto(pid);
            setTarefas(data || []);
            console.log(`✅ [TAREFAS] Carregadas ${data?.length || 0} tarefas para o projeto ID: ${pid}`);
        } catch (error: any) {
            console.error("❌ [TAREFAS] Erro ao carregar tarefas:", error);
            setError(error?.message || 'Falha ao carregar tarefas');
        } finally {
            setLoading(false);
        }
    }

    // Função para carregar membros do projeto
    async function carregarMembros(pid: string) {
        try {
            console.log(`⏳ [MEMBROS] Carregando membros para o projeto ID: ${pid}`);
            const lista = await ApiService.listarMembrosProjeto(pid);
            setMembros(lista || []);
            console.log(`✅ [MEMBROS] Carregados ${lista?.length || 0} membros para o projeto ID: ${pid}`);
        } catch (e) {
            console.error('❌ [MEMBROS] Erro ao carregar membros:', e);
            setMembros([]);
        }
    }

    // Função para formatar a data de exibição
    function formatarData(data: string | undefined) {
        if (!data) return "";
        const date = new Date(data);
        const dia = String(date.getUTCDate()).padStart(2, '0');
        const mes = date.getUTCMonth();
        const ano = date.getUTCFullYear();
        const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        return `${dia} ${meses[mes]} ${ano}`;
    }

    // Abre o modal para criar uma nova tarefa
    function handleOpenCreate() {
        setEditarTarefa(null);
        setIsModalOpen(true);
        console.log('📝 [MODAL] Abrindo para CRIAR nova tarefa');
    }

    // Abre o modal para editar uma tarefa existente
    function handleOpenEdit(tarefa: Tarefa) {
        setEditarTarefa(tarefa);
        setIsModalOpen(true);
        console.log('✏️ [MODAL] Abrindo para EDITAR:', tarefa.nome);
    }

    // 💾 SALVAR TAREFA - FUNÇÃO COMPLETA E DEFINITIVA
    async function handleSave(data: {
        name: string;
        description: string;
        responsible: string[];
        endDate: string;
        status: Status;
        comment: string;
        files: File[];
    }) {
        if (!projetoId) {
            alert('❌ Erro: Nenhum projeto selecionado. Por favor, selecione um projeto.');
            return;
        }
        console.log('💾 [SAVE] Iniciando salvamento...');
        console.log('   Nome:', data.name);
        console.log('   Arquivos:', data.files.length);
        console.log('   É edição?', !!editarTarefa);

        const tarefaPayload = {
            nome: data.name,
            descricao: data.description,
            status: data.status,
            comentario: data.comment,
            prazoFinal: data.endDate ? new Date(data.endDate).toISOString() : null,
            projetoId: projetoId, // Garante que o projetoId do estado seja usado
            usuarioIds: data.responsible
        };

        try {
            let tarefaId: string;
            if (editarTarefa) {
                // ✏️ EDITAR tarefa existente
                console.log('✏️ [SAVE] Atualizando tarefa ID:', editarTarefa.id);
                await ApiService.atualizarTarefa(editarTarefa.id, tarefaPayload);
                tarefaId = editarTarefa.id;
                console.log('✅ [SAVE] Tarefa atualizada no banco!');
            } else {
                // ➕ CRIAR nova tarefa
                console.log('➕ [SAVE] Criando nova tarefa...');
                const novaTarefa = await ApiService.criarTarefa(tarefaPayload);
                tarefaId = novaTarefa.id;
                console.log('✅ [SAVE] Tarefa criada com ID:', tarefaId);
            }

            // 📤 UPLOAD DE ANEXOS (CRÍTICO!)
            if (data.files && data.files.length > 0) {
                console.log(`📤 [UPLOAD] Enviando ${data.files.length} arquivo(s) para tarefa ${tarefaId}...`);
                await uploadAnexos(tarefaId, data.files);
                console.log('✅ [UPLOAD] Todos os anexos foram enviados!');
            } else {
                console.log('ℹ️ [UPLOAD] Sem arquivos para enviar');
            }

            // 🔄 RECARREGAR lista de tarefas
            console.log('🔄 [SAVE] Recarregando lista de tarefas...');
            await carregarTarefas(projetoId);

            // ✅ FECHAR MODAL
            console.log('✅ [SAVE] Fechando modal...');
            setIsModalOpen(false);
            setEditarTarefa(null);
            console.log('🎉 [SAVE] OPERAÇÃO CONCLUÍDA COM SUCESSO!');
            console.log('═══════════════════════════════════════');
        } catch (error) {
            console.error("❌ [SAVE] ERRO ao salvar:", error);
            alert("Erro ao salvar tarefa. Verifique o console.");
        }
    }

    // 📤 UPLOAD DE ANEXOS PARA O BACKEND
    async function uploadAnexos(tarefaId: string, files: File[]) {
        if (files.length === 0) return;
        const formData = new FormData();
        console.log('📦 [UPLOAD] Preparando FormData:');
        files.forEach((file, index) => {
            formData.append('files', file);
            console.log(`   ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        });

        try {
            console.log(`📡 [UPLOAD] Enviando para: ${API_BASE_URL}/api/anexos/tarefa/${tarefaId}`);
            const response = await axios.post(
                `${API_BASE_URL}/api/anexos/tarefa/${tarefaId}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                        console.log(`📊 [UPLOAD] Progresso: ${percentCompleted}%`);
                    }
                }
            );
            console.log('✅ [UPLOAD] Resposta do servidor:', response.status, response.data);
        } catch (error: any) {
            console.error('❌ [UPLOAD] Erro ao enviar arquivos:', error);
            console.error('   Detalhes:', error.response?.data || error.message);
            throw error;
        }
    }

    // 🗑️ DELETAR TAREFA - FUNÇÃO COMPLETA E DEFINITIVA
    async function handleDelete(tarefaId: string) {
        console.log('🗑️ [DELETE] Iniciando exclusão da tarefa:', tarefaId);
        try {
            // 1️⃣ Deletar ANEXOS primeiro
            console.log('📎 [DELETE] Tentando deletar anexos da tarefa...');
            try {
                await axios.delete(`${API_BASE_URL}/api/anexos/tarefa/${tarefaId}`);
                console.log('✅ [DELETE] Anexos deletados (se existiam)!');
            } catch (error: any) {
                // Não é um erro crítico se não houver anexos ou se a rota não existir para uma tarefa sem anexos
                console.warn('⚠️ [DELETE] Erro ao deletar anexos (pode ser que não existam ou rota não encontrada):', error.message);
            }

            // 2️⃣ Deletar TAREFA
            console.log('🗑️ [DELETE] Deletando tarefa do banco...');
            await ApiService.excluirTarefa(tarefaId);
            console.log('✅ [DELETE] Tarefa deletada do MongoDB!');

            // 3️⃣ RECARREGAR lista
            console.log('🔄 [DELETE] Recarregando lista...');
            if (projetoId) await carregarTarefas(projetoId);

            // 4️⃣ FECHAR modal
            console.log('✅ [DELETE] Fechando modal...');
            setIsModalOpen(false);
            setEditarTarefa(null);
            setConfirmandoExclusaoId(null);
            console.log('🎉 [DELETE] TAREFA DELETADA COM SUCESSO!');
            console.log('═══════════════════════════════════════');
        } catch (error) {
            console.error("❌ [DELETE] ERRO ao excluir:", error);
            alert("Erro ao excluir tarefa. Verifique o console.");
        }
    }

    // 🗑️ DELETAR TAREFA NO CARD (com confirmação)
    function deletarTarefaNoCard(e: React.MouseEvent, tarefaId: string) {
        e.stopPropagation(); // Impede que o clique no botão abra o modal de edição
        e.preventDefault(); // Impede qualquer comportamento padrão do evento

        if (confirmandoExclusaoId === tarefaId) {
            // 2ª vez - CONFIRMA e DELETA
            console.log('✅ [CARD] Confirmado! Deletando tarefa:', tarefaId);
            handleDelete(tarefaId);
        } else {
            // 1ª vez - PEDE CONFIRMAÇÃO
            console.log('⚠️ [CARD] Pedindo confirmação para:', tarefaId);
            setConfirmandoExclusaoId(tarefaId);
            // Cancela a confirmação após 4 segundos se o usuário não clicar novamente
            setTimeout(() => {
                setConfirmandoExclusaoId((curr) => {
                    if (curr === tarefaId) {
                        console.log('⏱️ [CARD] Timeout - confirmação de exclusão cancelada automaticamente');
                        return null;
                    }
                    return curr;
                });
            }, 4000);
        }
    }

    // ❌ CANCELAR EXCLUSÃO
    function cancelarExclusao(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        console.log('❌ [CARD] Exclusão cancelada pelo usuário');
        setConfirmandoExclusaoId(null);
    }

    // 🎯 DRAG AND DROP - ATUALIZA STATUS NA API
    async function onDragEnd(result: DropResult) {
        if (!result.destination) {
            console.log('❌ [DRAG] Cancelado - soltou fora da área válida');
            return;
        }

        const { draggableId, destination, source } = result;
        const novoStatus = destination.droppableId as Status;
        const statusAntigo = source.droppableId;

        if (statusAntigo === novoStatus) {
            console.log('ℹ️ [DRAG] Mesma coluna - sem alteração de status, nenhuma ação necessária');
            return;
        }

        const tarefa = tarefas.find(t => t.id === draggableId);
        if (!tarefa) {
            console.error('❌ [DRAG] Tarefa não encontrada no estado local:', draggableId);
            return;
        }

        console.log('🎯 [DRAG] Movendo tarefa:', tarefa.nome);
        console.log(`   De: "${statusAntigo}" → Para: "${novoStatus}"`);

        // Atualiza visual IMEDIATAMENTE para uma melhor experiência do usuário
        setTarefas(prev => prev.map(t =>
            t.id === draggableId ? { ...t, status: novoStatus } : t
        ));
        console.log('✅ [DRAG] Visual atualizado no frontend!');

        // Atualiza no BACKEND (MongoDB)
        try {
            console.log('📡 [DRAG] Enviando atualização de status para a API...');
            // Garante que projetoId seja sempre uma string para a API
            const currentProjetoId = projetoId || "";

            await ApiService.atualizarTarefa(draggableId, {
                nome: tarefa.nome,
                descricao: tarefa.descricao,
                status: novoStatus,
                comentario: tarefa.comentario || "",
                prazoFinal: tarefa.prazoFinal || null,
                projetoId: tarefa.projetoId || currentProjetoId, // Usa o projetoId da tarefa ou do estado
                usuarioIds: tarefa.usuarioIds || []
            });
            console.log('✅ [DRAG] Status atualizado no MONGODB com sucesso!');
            console.log('🎉 [DRAG] Drag and Drop CONCLUÍDO COM SUCESSO!');
            console.log('═══════════════════════════════════════');
        } catch (error: any) {
            console.error("❌ [DRAG] ERRO ao atualizar o status no backend:", error);
            console.error("   Detalhes do erro:", error.response?.data || error.message);
            // Reverte a mudança visual no frontend se a atualização da API falhar
            setTarefas(prev => prev.map(t =>
                t.id === draggableId ? { ...t, status: tarefa.status } : t
            ));
            console.log('↩️ [DRAG] Visual revertido devido a falha na API.');
            alert("Erro ao mover tarefa. A alteração foi revertida. Verifique o console para mais detalhes.");
        }
    }

    // Definição das colunas do quadro Kanban
    const columns = [
        { id: "Pendente", nome: "Pendentes", color: "text-yellow-700" },
        { id: "Desenvolvimento", nome: "Desenvolvimento", color: "text-gray-500" },
        { id: "Concluído", nome: "Concluído", color: "text-green-700" }
    ];

    // Renderiza conteúdo condicional para colunas (loading, erro, sem tarefas)
    const renderConteudoColuna = (colId: string) => {
        if (loading) return <p className="text-sm text-gray-500 px-3">Carregando tarefas...</p>;
        if (error) return <p className="text-sm text-red-600 px-3">Erro ao carregar: {error}</p>;
        const lista = tarefas.filter(t => t.status === colId);
        if (lista.length === 0) return <p className="text-sm italic text-gray-400 px-3 py-2">Nenhuma tarefa nesta coluna</p>;
        return null; // Se houver tarefas, não renderiza esta mensagem
    };

    return (
        <div className="flex h-screen relative">
            <Sidebar />
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 bg-white rounded-3xl p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar">
                    <div className="flex flex-row justify-center gap-10 w-full flex-1">
                        {columns.map((col) => (
                            <Droppable key={col.id} droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex flex-col flex-1 bg-[#F2EEE9] rounded-xl shadow-2xl transition-all duration-300 overflow-y-auto max-h-[calc(94vh-10rem)] min-h-[calc(94vh-10rem)]
                                            ${snapshot.isDraggingOver ? "bg-blue-100 border-4 border-blue-400 border-dashed" : ""}`}
                                    >
                                        <h5 className={`flex justify-center mb-4 text-2xl font-mono sticky top-0 z-10 bg-[#F2EEE9] py-2 ${col.color}`}>
                                            {col.nome}
                                        </h5>
                                        {renderConteudoColuna(col.id)}
                                        {tarefas.filter((t) => t.status === col.id).map((tarefa, index) => (
                                            <Draggable key={tarefa.id} draggableId={tarefa.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`p-3 m-2 bg-white rounded-xl shadow cursor-grab active:cursor-grabbing transition relative ${snapshot.isDragging ? "bg-blue-200 shadow-2xl scale-105 rotate-2" : "hover:bg-gray-50"
                                                            }`}
                                                        onClick={(e) => {
                                                            // Abre o modal de edição apenas se não estiver arrastando
                                                            if (!snapshot.isDragging) {
                                                                handleOpenEdit(tarefa);
                                                            }
                                                        }}
                                                    >
                                                        {/* BOTÕES DE EXCLUSÃO - VERTICAL E FUNCIONAIS */}
                                                        <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
                                                            {confirmandoExclusaoId === tarefa.id ? (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => deletarTarefaNoCard(e, tarefa.id)}
                                                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-lg transition-all duration-200 transform hover:scale-105"
                                                                        title="Confirmar exclusão"
                                                                    >
                                                                        Confirmar
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelarExclusao}
                                                                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold rounded shadow-lg transition-all duration-200 transform hover:scale-105"
                                                                        title="Cancelar exclusão"
                                                                    >
                                                                        Cancelar
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => deletarTarefaNoCard(e, tarefa.id)}
                                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-all duration-200 transform hover:scale-110"
                                                                    title="Excluir tarefa"
                                                                >
                                                                    <FaTrash size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col justify-between">
                                                            <div className="flex flex-col justify-center gap-2 pr-16">
                                                                <span className="text-lg font-semibold text-gray-800">{tarefa.nome}</span>
                                                                <p className="text-sm text-gray-600">{tarefa.descricao}</p>
                                                                {tarefa.comentario && (
                                                                    <p className="text-sm text-gray-600 italic">"{tarefa.comentario}"</p>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-between mt-7">
                                                                <p className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <FaRegUserCircle />
                                                                    {(() => {
                                                                        const ids = tarefa.usuarioIds || [];
                                                                        if (ids.length === 0) return 'Sem responsável';
                                                                        const nomes = ids
                                                                            .map(id => membros.find(m => m.usuarioId === id)?.nome || id)
                                                                            .filter(Boolean);
                                                                        if (nomes.length <= 2) return nomes.join(', ');
                                                                        return nomes.slice(0, 2).join(', ') + ` (+${nomes.length - 2})`;
                                                                    })()}
                                                                </p>
                                                                <p className="flex items-center gap-1 text-xs text-gray-500">
                                                                    {formatarData(tarefa.prazoFinal)}
                                                                    <FaCalendarAlt />
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder} {/* Essencial para o Droppable funcionar corretamente */}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                    <div
                        className="flex items-center justify-center bg-[#377CD4] w-full h-16 rounded-lg cursor-pointer mt-4 hover:bg-[#2a5fa0] transition-colors shadow-lg"
                        onClick={handleOpenCreate}
                    >
                        <h5 className="text-3xl text-white font-mono">Criar Tarefa</h5>
                    </div>
                </div>
            </DragDropContext>
            {/* MODAL - AGORA VAI FUNCIONAR PERFEITAMENTE! */}
            <ModalTarefa
                isOpen={isModalOpen}
                onClose={() => {
                    console.log('❌ [MODAL] Fechado pelo usuário (X)');
                    setIsModalOpen(false);
                    setEditarTarefa(null);
                }}
                onSave={handleSave}
                onDelete={handleDelete}
                membrosProjeto={membros.map(m => ({ id: m.usuarioId, nome: m.nome, email: m.email }))}
                initialData={editarTarefa ? {
                    id: editarTarefa.id,
                    name: editarTarefa.nome || "",
                    description: editarTarefa.descricao || "",
                    responsible: editarTarefa.usuarioIds || [],
                    endDate: editarTarefa.prazoFinal ? editarTarefa.prazoFinal.split('T')[0] : "",
                    status: editarTarefa.status as Status,
                    comment: editarTarefa.comentario || "",
                } : undefined}
            />
        </div>
    )
}
