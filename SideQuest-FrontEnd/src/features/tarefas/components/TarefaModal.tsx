import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useModalTarefa, type FormData, type AnexoLocal } from "../hooks/useModalTarefas";
import type { MembroProjeto } from "../../../types/Membro";
import { FiTrash2, FiFile, FiImage, FiVideo, FiUploadCloud } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";

interface ModalTarefaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData, uploadFn: (tarefaId: string) => Promise<any>, deleteFn: () => Promise<void>) => void;
  onDelete: (id: string) => void;
  initialData?: Partial<FormData> & { id?: string };
  membrosProjeto: MembroProjeto[];
}

function FileIcon({ tipo }: { tipo: "image" | "pdf" | "video" }) {
  const iconClass = "w-8 h-8";
  switch (tipo) {
    case "image":
      return <FiImage className={`${iconClass} text-blue-500`} />;
    case "pdf":
      return <HiOutlineDocumentText className={`${iconClass} text-red-500`} />;
    case "video":
      return <FiVideo className={`${iconClass} text-purple-500`} />;
    default:
      return <FiFile className={`${iconClass} text-gray-500`} />;
  }
}

function AnexoItem({
  anexo,
  index,
  onRemove,
}: {
  anexo: AnexoLocal;
  index: number;
  onRemove: (index: number) => void;
}) {
  return (
    <div
      className={`
        relative flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200
        hover:bg-gray-100 hover:border-gray-300 transition-all duration-200
        animate-fadeIn min-h-[70px]
      `}
    >
      {/* Badge Novo - BEM VISÍVEL */}
      {anexo.isNew && (
        <div
          className="
            absolute -top-2 right-2 px-3 py-1 text-xs font-bold uppercase tracking-wide
            bg-gradient-to-r from-green-500 to-emerald-600 text-white
            rounded-full shadow-lg z-20
            border-2 border-white
            flex items-center gap-1
          "
          style={{
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.5), 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <span>✨</span>
          <span>Novo</span>
        </div>
      )}

      {/* Botão Deletar Vermelho */}
      <button
        onClick={() => onRemove(index)}
        className="
          flex-shrink-0 p-2 rounded-lg bg-red-500 text-white
          hover:bg-red-600 transition-all duration-200
          hover:scale-105 active:scale-95 shadow-sm
        "
        title="Remover anexo"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>

      {/* Ícone do tipo de arquivo */}
      <div className="flex-shrink-0">
        <FileIcon tipo={anexo.tipo} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate" title={anexo.nome}>
          {anexo.nome}
        </p>
        <p className="text-xs text-gray-500">
          {anexo.tamanho}
          {anexo.dataUpload && (
            <span className="ml-2">
              • {new Date(anexo.dataUpload).toLocaleDateString("pt-BR")}
            </span>
          )}
          {!anexo.isSaved && (
            <span className="ml-2 text-amber-600 font-medium">• Pendente</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function ModalTarefa({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  membrosProjeto = [],
}: ModalTarefaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    formData,
    showDeleteConfirm,
    mostrarListaResponsaveis,
    toastMsg,
    toastType,
    anexos,
    loadingAnexos,
    uploadingAnexos,
    isDraggingFile,
    handleInputChange,
    toggleResponsavel,
    showToast,
    handleClose,
    setShowDeleteConfirm,
    setMostrarListaResponsaveis,
    adicionarAnexos,
    removerAnexo,
    uploadAnexosPendentes,
    deletarAnexosMarcados,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useModalTarefa({ initialData, isOpen, onClose });

  const handleDateChange = (field: "endDate") => (e: ChangeEvent<HTMLInputElement>) => {
    handleInputChange(field, e.target.value);
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("status", e.target.value);
  };

  const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange("comment", e.target.value);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      if (initialData?.id) {
        onDelete(initialData.id);
        handleClose();
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast("Preencha o nome da tarefa", "error");
      return;
    }
    onSave(formData, uploadAnexosPendentes, deletarAnexosMarcados);
    handleClose();
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      adicionarAnexos(e.target.files);
      e.target.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  const membrosOrdenados = [...membrosProjeto].sort((a: MembroProjeto, b: MembroProjeto) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  const anexosSalvos = anexos.filter((a: AnexoLocal) => a.isSaved).length;
  const anexosPendentes = anexos.filter((a: AnexoLocal) => !a.isSaved).length;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.5); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .hover-glow:hover {
          animation: glow 1.5s ease-in-out infinite;
        }
        .upload-zone-active {
          background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%);
          border-color: #3b82f6;
          transform: scale(1.02);
        }
      `}</style>

      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="bg-red-50 rounded-3xl p-8 m-2">
            <header className="relative mb-8">
              <input
                type="text"
                placeholder="Digite o nome da tarefa..."
                value={formData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
                className="w-full text-center text-2xl font-semibold text-slate-800 bg-transparent outline-none mt-4 placeholder:text-slate-400"
              />
              <div className="w-80 h-px bg-slate-600 mx-auto mt-4"></div>
              <button onClick={handleClose} className="absolute -top-4 -right-4 w-16 h-16 rounded-full">
                <img
                  src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/NaTQuP3JqU.png"
                  alt="Fechar"
                  className="w-full h-full"
                />
              </button>
            </header>

            <main className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      onClick={() => setMostrarListaResponsaveis((v: boolean) => !v)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {mostrarListaResponsaveis ? "ocultar" : "selecionar"}
                    </button>
                  </div>
                  {formData.responsible.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.responsible.map((r: string, idx: number) => {
                        const m = membrosProjeto.find((mb: MembroProjeto) => mb.usuarioId === r);
                        return (
                          <span key={`resp-${r}-${idx}`} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
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
                      {membrosOrdenados.map((m: MembroProjeto) => {
                        const checked = formData.responsible.includes(m.usuarioId);
                        return (
                          <label key={m.usuarioId} className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleResponsavel(m.usuarioId)}
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
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                    placeholder="Digite a descrição da tarefa..."
                    className="w-full h-20 text-xs font-bold text-black text-opacity-50 resize-none outline-none placeholder-black placeholder-opacity-50 border border-gray-200 rounded p-2"
                  />
                </section>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <section className="bg-white rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/MLnEE1uNpx.png"
                      alt="Calendário"
                      className="w-7 h-7"
                    />
                    <h2 className="text-xs text-black text-opacity-50 font-poppins">Prazo</h2>
                  </div>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={handleDateChange("endDate")}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full text-sm font-bold text-black text-opacity-50 outline-none"
                  />
                </section>

                <section className="bg-white rounded-3xl p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/TunmLKqMtD.png"
                      alt="Status"
                      className="w-4 h-4"
                    />
                    <h2 className="text-xs text-black text-opacity-50 font-poppins">Status</h2>
                  </div>
                  <div className="flex justify-center items-center flex-1">
                    <select
                      value={formData.status}
                      onChange={handleStatusChange}
                      className="w-full text-sm font-bold text-black text-opacity-70 bg-transparent outline-none text-center px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    >
                      <option value="Pendente" className="bg-white text-black">Pendente</option>
                      <option value="Desenvolvimento" className="bg-white text-black">Desenvolvimento</option>
                      <option value="Concluído" className="bg-white text-black">Concluído</option>
                    </select>
                  </div>
                </section>

                {/* Botão de Anexar com Hover Bonito */}
                <section
                  className={`
                    bg-white rounded-3xl p-6 flex flex-col cursor-pointer
                    transition-all duration-300 ease-out
                    border-2 border-dashed border-transparent
                    hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50
                    hover:shadow-xl hover:scale-[1.02]
                    hover-glow
                    ${isDraggingFile ? "upload-zone-active border-blue-500" : ""}
                  `}
                  onClick={openFileDialog}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf,.mp4"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex justify-center items-center h-full gap-3 group">
                    <div className={`
                      relative transition-all duration-300
                      group-hover:scale-110 ${isDraggingFile ? "animate-float" : ""}
                    `}>
                      <FiUploadCloud className={`
                        w-12 h-12 transition-all duration-300
                        ${isDraggingFile ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}
                      `} />
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 animate-shimmer" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`
                        text-lg font-medium transition-all duration-300
                        ${isDraggingFile ? "text-blue-600" : "text-black text-opacity-50 group-hover:text-blue-600"}
                      `}>
                        {isDraggingFile ? "Solte aqui!" : "Anexar arquivo"}
                      </span>
                      <span className="text-[10px] text-gray-400 group-hover:text-blue-400 transition-colors">
                        PNG, JPEG, PDF, MP4 (máx. 200MB)
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Seção de Arquivos */}
              <section className="bg-white rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/PkXAyxCnPq.png"
                      alt="Arquivos"
                      className="w-10 h-10"
                    />
                    <div>
                      <h2 className="text-2xl text-black text-opacity-50 font-poppins">Arquivos</h2>
                      {anexos.length > 0 && (
                        <p className="text-xs text-gray-400">
                          {anexosSalvos > 0 && `${anexosSalvos} salvo(s)`}
                          {anexosSalvos > 0 && anexosPendentes > 0 && " • "}
                          {anexosPendentes > 0 && (
                            <span className="text-amber-600">{anexosPendentes} pendente(s)</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {loadingAnexos && (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Carregando anexos...</span>
                    </div>
                  </div>
                )}

                {!loadingAnexos && anexos.length === 0 && (
                  <div
                    className={`
                      h-32 flex flex-col items-center justify-center text-gray-400
                      border-2 border-dashed border-gray-200 rounded-xl
                      transition-all duration-300
                      ${isDraggingFile ? "border-blue-400 bg-blue-50" : ""}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <FiFile className="w-8 h-8 mb-2 opacity-50" />
                    <span>Nenhum arquivo anexado</span>
                    <span className="text-xs mt-1">Arraste arquivos ou clique no botão acima</span>
                  </div>
                )}

                {!loadingAnexos && anexos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-56 overflow-y-auto pt-4 pr-2">
                    {anexos.map((anexo: AnexoLocal, index: number) => (
                      <AnexoItem
                        key={`${anexo.nome}-${index}`}
                        anexo={anexo}
                        index={index}
                        onRemove={removerAnexo}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-3xl p-6">
                <textarea
                  value={formData.comment}
                  onChange={handleCommentChange}
                  placeholder="Comentário..."
                  className="w-full h-20 text-xl text-black text-opacity-50 font-inter resize-none outline-none placeholder-black placeholder-opacity-50"
                />
              </section>
            </main>

            <footer className="flex justify-between items-center mt-8">
              <button
                onClick={handleDelete}
                className={`px-4 py-2 rounded-lg font-semibold text-sm text-red-50 transition-colors ${showDeleteConfirm ? "bg-red-700" : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {showDeleteConfirm ? "CONFIRMAR EXCLUSÃO" : "EXCLUIR"}
              </button>

              <button
                onClick={handleSave}
                disabled={uploadingAnexos}
                className={`
                  px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-sm text-white
                  transition-all duration-200 flex items-center gap-2
                  ${!formData.name.trim() || uploadingAnexos ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {uploadingAnexos && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {uploadingAnexos ? "ENVIANDO..." : "SALVAR"}
              </button>
            </footer>
          </div>
        </div>

        {toastMsg && (
          <div
            className={`
              fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-white text-sm
              animate-fadeIn z-[60]
              ${toastType === "success" ? "bg-green-500" : "bg-red-600"}
            `}
          >
            {toastMsg}
          </div>
        )}
      </div>
    </>
  );
}
