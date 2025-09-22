import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react';

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
    initialData?: {
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

export default function ModalTarefa({ isOpen, onClose, onSave, initialData }: ModalTarefaProps) {
    // Aqui, os ESTADOS armazenam as informações que podem mudar na tela, fazendo com que o React atualize automaticamente quando algo muda
    // Aqui, as FUNÇÕES executam ações específicas como adicionar pessoas ou salvar dados, fazendo com que o código fique organizado em blocos
    // Aqui, as AÇÕES DE BOTÕES respondem aos cliques do usuário, fazendo com que cada botão execute uma tarefa diferente

    // Estados: controle de modais, dados do formulário e campos temporários
    const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
    const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        responsible: [],
        endDate: '2025-12-25',
        status: 'Desenvolvimento',
        comment: ''
    });
    const [tempDescription, setTempDescription] = useState<string>(''); // Input temporário de texto para descrição
    const [newPersonName, setNewPersonName] = useState<string>(''); // Input de texto para nome da pessoa

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
    }, [initialData, isOpen]);

    // Funções: atualização de dados, adição/remoção de pessoas e salvamento
    const handleInputChange = (field: FormField, value: string | string[] | StatusType): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addPerson = (): void => {
        if (newPersonName.trim()) {
            setFormData(prev => ({
                ...prev,
                responsible: [...prev.responsible, newPersonName.trim()]
            }));
            setNewPersonName('');
            setIsAddPersonModalOpen(false);
        }
    };

    const removePerson = (index: number): void => {
        setFormData(prev => ({
            ...prev,
            responsible: prev.responsible.filter((_, i) => i !== index)
        }));
    };

    const saveDescription = (): void => {
        setFormData(prev => ({ ...prev, description: tempDescription }));
        setTempDescription('');
    };

    // Ações dos botões: exclusão com confirmação, salvamento e conclusão
    const handleDelete = (): void => {
        if (showDeleteConfirm) {
            setIsModalOpen(false);
            setShowDeleteConfirm(false);
            alert('Tarefa excluída com sucesso!');
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const handleSave = (): void => {
        onSave(formData)
        alert('Tarefa salva com sucesso!');
    };

    const handleComplete = (): void => {
        onSave({...formData, status: "Concluído"});
        alert('Tarefa concluída com sucesso!');
        onClose();
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
    };

    // Handlers para eventos
    const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        setTempDescription(e.target.value);
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

    const handlePersonNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setNewPersonName(e.target.value);
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            addPerson();
        }
    };

    const handleCancelAddPerson = (): void => {
        setIsAddPersonModalOpen(false);
        setNewPersonName('');
    };

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
                            <h1 className="text-6xl font-medium text-slate-600 text-center font-poppins">
                                TAREFA
                            </h1>
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
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/y0xgE4hNy9.png"
                                            alt="Usuário"
                                            className="w-6 h-6"
                                        />
                                        <h2 className="text-sm text-black text-opacity-50 font-poppins">Responsável</h2>
                                    </div>
                                    {/* Lista de responsáveis com botões de remoção vermelhos circulares */}
                                    <div className="space-y-2 mb-4">
                                        {formData.responsible.map((person: string, index: number) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="text-sm font-semibold text-black text-opacity-50">
                                                    {person}
                                                </div>
                                                <button
                                                    onClick={() => removePerson(index)}
                                                    className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setIsAddPersonModalOpen(true)}
                                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/uMnwUMNQSc.svg"
                                            alt="Adicionar"
                                            className="w-6 h-6"
                                        />
                                        <span className="text-sm">Adicionar pessoa</span>
                                    </button>
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
                                    {/* Exibe descrição salva se existir */}
                                    {formData.description ? (
                                        <div className="text-xs font-bold text-black text-opacity-50 mb-2">
                                            {formData.description}
                                        </div>
                                    ) : null}
                                    {/* Input de descrição com botão salvar - layout flexbox horizontal */}
                                    <div className="flex gap-2">
                                        <textarea
                                            value={tempDescription}
                                            onChange={handleTextAreaChange}
                                            placeholder="Digite a descrição da tarefa..."
                                            className="flex-1 h-12 text-xs font-bold text-black text-opacity-50 resize-none outline-none placeholder-black placeholder-opacity-50 border border-gray-200 rounded p-2"
                                        />
                                        <button
                                            onClick={saveDescription}
                                            disabled={!tempDescription.trim()}
                                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
                                        >
                                            Salvar
                                        </button>
                                    </div>
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
                                        {/* DATE INPUT - campo de data de fim */}
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={handleDateChange('endDate')}
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
                                            className="text-sm font-bold text-black text-opacity-50 outline-none bg-transparent text-center relative z-10"
                                        >
                                            <option value="Pendente">Pendente</option>
                                            <option value="Desenvolvimento">Desenvolvimento</option>
                                            <option value="Concluído">Concluído</option>
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
                            {/* Grupo de botões à esquerda - gap pequeno entre eles */}
                            <div className="flex gap-3">
                                {/* Botão excluir - vermelho, muda texto quando confirma */}
                                <button
                                    onClick={handleDelete}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm text-red-50 transition-colors ${showDeleteConfirm ? 'bg-red-700' : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {showDeleteConfirm ? 'CONFIRMAR EXCLUSÃO' : 'EXCLUIR'}
                                </button>
                                {/* Botão salvar - azul padrão */}
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-sm text-red-50 transition-colors"
                                >
                                    SALVAR
                                </button>
                            </div>
                            {/* Botão concluir - verde, posicionado na extrema direita */}
                            <button
                                onClick={handleComplete}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold text-sm text-red-50 transition-colors"
                            >
                                CONCLUIR
                            </button>
                        </footer>
                    </div>
                </div>
            </div>

            {/* Modal Secundário - Adicionar Pessoa */}
            {isAddPersonModalOpen && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-[9999]">
                    {/* Card modal menor - fundo branco, bordas menos arredondadas */}
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-center">Adicionar Responsável</h2>
                        {/* TEXT INPUT - campo para nome da nova pessoa */}
                        <input
                            type="text"
                            value={newPersonName}
                            onChange={handlePersonNameChange}
                            placeholder="Nome do responsável"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 outline-none focus:border-blue-500"
                            onKeyPress={handleKeyPress}
                        />
                        {/* Botões alinhados à direita */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelAddPerson}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={addPerson}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}