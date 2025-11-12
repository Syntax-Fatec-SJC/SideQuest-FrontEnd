import type { ChangeEvent } from "react";
import { useModalTarefa, type FormData } from "../hooks/useModalTarefas";
import type { MembroProjeto } from "../../../types/Membro";


interface ModalTarefaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void; 
  onDelete: (id: string) => void;
  initialData?: Partial<FormData> & { id?: string }; 
  membrosProjeto: MembroProjeto[];
}


export default function ModalTarefa({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  membrosProjeto = [],
}: ModalTarefaProps) {
  const {
    formData,
    showDeleteConfirm,
    mostrarListaResponsaveis,
    toastMsg,
    handleInputChange,
    toggleResponsavel,
    showToast,
    handleClose,
    setShowDeleteConfirm,
    setMostrarListaResponsaveis
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
        handleClose(); // fecha modal
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast("Preencha o nome da tarefa");
      return;
    }
    onSave(formData);
    handleClose();
  };

  if (!isOpen) return null;

  const membrosOrdenados = [...membrosProjeto].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="bg-red-50 rounded-3xl p-8 m-2">
            <header className="relative mb-8">
              <input
                type="text"
                placeholder="Digite o nome da tarefa..."
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
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
                      onClick={() => setMostrarListaResponsaveis((v) => !v)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {mostrarListaResponsaveis ? "ocultar" : "selecionar"}
                    </button>
                  </div>
                  {formData.responsible.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.responsible.map((r) => {
                        const m = membrosProjeto.find((m) => m.usuarioId === r);
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
                    onChange={(e) => handleInputChange("description", e.target.value)}
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
                className={`px-4 py-2 rounded-lg font-semibold text-sm text-red-50 transition-colors ${
                  showDeleteConfirm ? "bg-red-700" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {showDeleteConfirm ? "CONFIRMAR EXCLUSÃO" : "EXCLUIR"}
              </button>

              <button
                onClick={handleSave}
                className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-sm text-red-50 transition-colors ${
                  !formData.name.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
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
    </>
  );
}
