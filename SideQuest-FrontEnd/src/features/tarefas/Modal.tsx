import { useEffect, useState, type ChangeEvent } from 'react';

interface ModalTarefaProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        name: string;
        description: string;
        responsible: string[];
        endDate: string;
        status: "Pendente" | "Desenvolvimento" | "Concluído";
        comment: string;
    }) => void;
    onDelete: (tarefaId: string) => void;
    membrosProjeto?: { id: string; nome: string; email: string }[];
    initialData?: {
        id: string;
        name: string;
        description: string;
        responsible: string[];
        endDate: string;
        status: "Pendente" | "Desenvolvimento" | "Concluído";
        comment: string;
    };
}

// Interfaces de tipagem
interface FormData {
    name: string;
    description: string;
    responsible: string[];
    endDate: string;
    status: 'Pendente' | 'Desenvolvimento' | 'Concluído';
    comment: string;
}

type FormField = keyof FormData;
type StatusType = FormData['status'];

export default function ModalTarefa({ isOpen, onClose, onSave, onDelete, initialData, membrosProjeto = [] }: ModalTarefaProps) {
    // Aqui, os ESTADOS armazenam as informações que podem mudar na tela, fazendo com que o React atualize automaticamente quando algo muda
    // Aqui, as FUNÇÕES executam ações específicas como adicionar pessoas ou salvar dados, fazendo com que o código fique organizado em blocos
    // Aqui, as AÇÕES DE BOTÕES respondem aos cliques do usuário, fazendo com que cada botão execute uma tarefa diferente

    // Estados: controle de modais, dados do formulário e campos temporários
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [mostrarListaResponsaveis, setMostrarListaResponsaveis] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        responsible: [],
        endDate: '2025-12-25',
        status: 'Desenvolvimento',
        comment: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: "",
                description: "",
                responsible: [],
                endDate: "",
                status: "Pendente",
                comment: "",
            });
        }
        setShowDeleteConfirm(false)
    }, [initialData, isOpen]);

    // Funções: atualização de dados, adição/remoção de pessoas e salvamento
    const handleInputChange = (field: FormField, value: string | string[] | StatusType): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleResponsavel = (usuarioId: string) => {
        setFormData(prev => {
            const jaExiste = prev.responsible.includes(usuarioId);
            return {
                ...prev,
                responsible: jaExiste
                    ? prev.responsible.filter(id => id !== usuarioId)
                    : [...prev.responsible, usuarioId]
            };
        });
    };

    const handleDelete = (): void => {
        if (showDeleteConfirm) {
            if (initialData && initialData.id) {
                onDelete(initialData.id);
            }
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const handleSave = (): void => {
        if (!formData.name.trim()) {
            showToast("Preencha o nome da tarefa");
            return;
        }
        onSave(formData);
    };



    const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        handleInputChange('comment', e.target.value);
    };

    const handleDateChange = (field: 'endDate') => (e: ChangeEvent<HTMLInputElement>): void => {
        handleInputChange(field, e.target.value);
    };

    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        handleInputChange('status', e.target.value as StatusType);
    };

    const [toastMsg, setToastMsg] = useState<string | null>(null);


    const showToast = (message: string) => {
        setToastMsg(message);
        setTimeout(() => setToastMsg(null), 3000); // desaparece após 3s
    };




    // Ordena membros por nome para exibição consistente
    const membrosOrdenados = [...membrosProjeto].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    // Tela inicial quando modal está fechado
    if (!isOpen) return null

    return (
        <>
            {/* Modal Principal - Overlay com fundo escuro semi-transparente */}
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
                {/* Container do modal - fundo branco, bordas arredondadas de 24px, max-width responsivo */}
                <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    {/* Card principal com cor de fundo rosa claro customizada */}
                    <div className="bg-red-50 rounded-3xl p-8 m-2">

                        {/* Header do Modal */}
                        <header className="relative mb-8">
                            {/* Título principal - fonte Poppins, tamanho 6xl, cor slate-600 */}
                            <input
                                type="text"
                                placeholder="Digite o nome da tarefa..."
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full text-center text-2xl font-semibold text-slate-800 bg-transparent outline-none mt-4 placeholder:text-slate-400"
                            />
                            {/* Linha divisória decorativa - largura 320px, altura 1px */}
                            <div className="w-80 h-px bg-slate-600 mx-auto mt-4"></div>
                            {/* Botão de fechar - posicionado no canto superior direito com offset negativo */}
                            <button
                                onClick={onClose}
                                className="absolute -top-4 -right-4 w-16 h-16 rounded-full"
                            >
                                <img
                                    src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/NaTQuP3JqU.png"
                                    alt="Fechar"
                                    className="w-full h-full"
                                />
                            </button>
                        </header>

                        {/* Conteúdo Principal */}
                        <main className="space-y-6">

                            {/* Primeira Seção - Grid responsivo 2 colunas */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Card Responsáveis - fundo branco, bordas 24px, padding 6 */}
                                <section className="bg-white rounded-3xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/y0xgE4hNy9.png"
                                                alt="Usuário"
                                                className="w-6 h-6"
                                            />
                                            <h2 className="text-sm text-black text-opacity-50 font-poppins">Responsáveis</h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMostrarListaResponsaveis(v => !v)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {mostrarListaResponsaveis ? 'ocultar' : 'selecionar'}
                                        </button>
                                    </div>
                                    {formData.responsible.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.responsible.map(r => {
                                                const m = membrosProjeto.find(m => m.id === r);
                                                return (
                                                    <span key={r} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                        {m?.nome || r}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {mostrarListaResponsaveis && (
                                        <div className="max-h-40 overflow-auto pr-1 space-y-1 border rounded p-2 bg-gray-50">
                                            {membrosOrdenados.length === 0 && (
                                                <p className="text-xs text-gray-400">Nenhum membro disponível</p>
                                            )}
                                            {membrosOrdenados.map(m => {
                                                const checked = formData.responsible.includes(m.id);
                                                return (
                                                    <label key={m.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleResponsavel(m.id)}
                                                            className="accent-blue-600"
                                                        />
                                                        <span className="text-gray-700 font-medium">{m.nome}</span>
                                                        <span className="text-gray-400">{m.email}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>

                                {/* Card Descrição - fundo branco, sistema de edição e exibição */}
                                <section className="bg-white rounded-3xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/KNtb3tMQCX.png"
                                            alt="Documento"
                                            className="w-6 h-6"
                                        />
                                        <h2 className="text-sm text-black text-opacity-50 font-poppins">Descrição</h2>
                                    </div>

                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Digite a descrição da tarefa..."
                                        className="w-full h-20 text-xs font-bold text-black text-opacity-50 resize-none outline-none placeholder-black placeholder-opacity-50 border border-gray-200 rounded p-2"
                                    />
                                </section>
                            </div>

                            {/* Segunda Seção - Grid 3 colunas responsivo */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Card Prazo - campos de data */}
                                <section className="bg-white rounded-3xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/MLnEE1uNpx.png"
                                            alt="Calendário"
                                            className="w-7 h-7"
                                        />
                                        <h2 className="text-xs text-black text-opacity-50 font-poppins">Prazo</h2>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={handleDateChange('endDate')}
                                            min={new Date().toISOString().split('T')[0]} 
                                            className="w-full text-sm font-bold text-black text-opacity-50 outline-none"
                                        />
                                    </div>
                                </section>

                                {/* Card Status - select centralizado verticalmente no meio do card */}
                                <section className="bg-white rounded-3xl p-6 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/TunmLKqMtD.png"
                                            alt="Status"
                                            className="w-4 h-4"
                                        />
                                        <h2 className="text-xs text-black text-opacity-50 font-poppins">Status</h2>
                                    </div>
                                    {/* Select centralizado no meio do card usando flex-1 */}
                                    <div className="flex justify-center items-center flex-1">
                                        <select
                                            value={formData.status}
                                            onChange={handleStatusChange}
                                            className="w-full text-sm font-bold text-black text-opacity-70 bg-transparent outline-none text-center px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition relative z-10"
                                        >
                                            <option value="Pendente" className="bg-white text-black">Pendente</option>
                                            <option value="Desenvolvimento" className="bg-white text-black">Desenvolvimento</option>
                                            <option value="Concluído" className="bg-white text-black">Concluído</option>
                                        </select>
                                    </div>
                                </section>

                                {/* Card Upload - conteúdo centralizado no meio do card */}
                                <section className="bg-white rounded-3xl p-6 flex flex-col">
                                    <div className="flex justify-center items-center h-full">
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/fnh8pRWwYV.png"
                                            alt="Upload"
                                            className="w-11 h-11 mr-4"
                                        />
                                        <span className="text-xl text-black text-opacity-50 font-poppins">
                                            Anexar um arquivo
                                        </span>
                                    </div>
                                </section>
                            </div>

                            {/* Card Arquivos - área de visualização */}
                            <section className="bg-white rounded-3xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/PkXAyxCnPq.png"
                                        alt="Arquivos"
                                        className="w-10 h-10"
                                    />
                                    <h2 className="text-2xl text-black text-opacity-50 font-poppins">Arquivos</h2>
                                </div>
                                <div className="h-32 flex items-center justify-center text-gray-400">
                                    <span>Nenhum arquivo anexado</span>
                                </div>
                            </section>

                            {/* Card Comentários - textarea sem redimensionamento */}
                            <section className="bg-white rounded-3xl p-6">
                                <textarea
                                    value={formData.comment}
                                    onChange={handleCommentChange}
                                    placeholder="Comentário..."
                                    className="w-full h-20 text-xl text-black text-opacity-50 font-inter resize-none outline-none placeholder-black placeholder-opacity-50"
                                />
                            </section>
                        </main>

                        {/* Footer - Botões de ação alinhados nas extremidades */}
                        <footer className="flex justify-between items-center mt-8">
                            {/* Botão de exclusão fica à esquerda */}
                            <button
                                onClick={handleDelete}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm text-red-50 transition-colors ${showDeleteConfirm ? 'bg-red-700' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {showDeleteConfirm ? 'CONFIRMAR EXCLUSÃO' : 'EXCLUIR'}
                            </button>

                            {/* Botão de salvamento fica à direita */}
                            <button
                                onClick={handleSave}
                                className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-sm text-red-50 transition-colors
        ${!formData.name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                SALVAR
                            </button>
                        </footer>
                    </div>
                </div>
                {toastMsg && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white text-sm bg-red-600">
                        {toastMsg}
                    </div>
                )}

            </div>

            {/* Modal secundário removido: agora seleção via checkboxes inline */}
        </>
    );
}