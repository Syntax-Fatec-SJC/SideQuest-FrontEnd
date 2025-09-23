// Modal criada apenas para teste, eventualmente sera apagado para integração com o modal principal

import React, { useEffect, useState } from "react";

interface TarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    nome: string;
    status: string;
    descricao?: string;
    comentarios?: string;
    prazo: string;
    responsavel: string;
  }) => void;
  tarefa?: {
    nome: string;
    status: string;
    descricao?: string;
    comentarios?: string;
    prazo: string;
    responsavel: string;
  } | null;
}

export default function ModalTarefaT({
  isOpen,
  onClose,
  onSave,
  tarefa,
}: TarefaModalProps) {
  const [nome, setNome] = useState("");
  const [status, setStatus] = useState("Pendente");
  const [descricao, setDescricao] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [prazo, setPrazo] = useState("");
  const [responsavel, setResponsavel] = useState("");

  useEffect(() => {
    if (tarefa) {
      setNome(tarefa.nome);
      setStatus(tarefa.status);
      setDescricao(tarefa.descricao ?? "");
      setComentarios(tarefa.comentarios ?? "");
      setPrazo(tarefa.prazo);
      setResponsavel(tarefa.responsavel);
    } else {
      setNome("");
      setStatus("Pendente");
      setDescricao("");
      setComentarios("");
      setPrazo("");
      setResponsavel("");
    }
  }, [tarefa]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded-2xl shadow-lg flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-center">
          {tarefa ? "Editar Tarefa" : "Criar Tarefa"}
        </h2>

        {/* Nome */}
        <input
          type="text"
          placeholder="Nome da Tarefa"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        >
          <option value="Pendente">Pendente</option>
          <option value="Desenvolvimento">Desenvolvimento</option>
          <option value="Concluído">Concluído</option>
        </select>

        {/* Descrição */}
        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />

        {/* Comentários */}
        <textarea
          placeholder="Comentários"
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />

        {/* Prazo */}
        <input
          type="date"
          value={prazo ? prazo.split("T")[0] : ""}
          onChange={(e) => setPrazo(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />

        {/* Responsável */}
        <input
          type="text"
          placeholder="Responsável"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />

        {/* Botões */}
        <div className="flex justify-end gap-4 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSave({ nome, status, descricao, comentarios, prazo, responsavel })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}


