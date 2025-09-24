import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import axios from "axios";

interface Member {
    id?: string;
    nome: string;
    email: string;
    funcao: string;
    isEditing: boolean;
}

export default function Membros() {
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState("");
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const BASE_URL = "http://localhost:8080/membros";

    // Carregar membros do backend
    useEffect(() => {
        axios.get(BASE_URL)
            .then(res => setMembers(res.data.map((m: any) => ({ ...m, isEditing: false }))))
            .catch(() => setToastMessage("Erro ao carregar membros"));
    }, []);

    // Toast timer
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const addMember = () => {
        const creatingMemberExists = members.some(m => m.isEditing);
        if (creatingMemberExists) {
            setToastMessage("Salve o membro atual antes de adicionar um novo!");
            return;
        }

        setMembers([
            { nome: "", email: "", funcao: "", isEditing: true },
            ...members,
        ]);
    };

    const toggleEdit = async (index: number) => {
        const editingMemberExists = members.some((m, i) => m.isEditing && i !== index);
        if (editingMemberExists) {
            setToastMessage("Salve o membro atual antes de editar outro!");
            return;
        }

        const member = members[index];
        const form = document.getElementById(`member-form-${index}`) as HTMLFormElement | null;
        if (!form) return;

        if (member.isEditing) {
            // Validar campos
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Validação customizada de email
            if (!/\S+@\S+\.\S+/.test(member.email)) {
                setToastMessage("Email inválido!");
                return;
            }

            try {
                let res;
                if (member.id) {
                    res = await axios.put(`${BASE_URL}/${member.id}`, member);
                } else {
                    res = await axios.post(BASE_URL, member);
                }
                const updatedMember = { ...res.data, isEditing: false };
                setMembers(prev => prev.map((m, i) => i === index ? updatedMember : m));
            } catch (err: any) {
                setToastMessage(err.response?.data?.message || "Erro ao salvar membro");
            }
        } else {
            setMembers(prev => prev.map((m, i) => i === index ? { ...m, isEditing: true } : m));
        }
    };

    const handleChange = (index: number, field: keyof Member, value: string) => {
        setMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    };

    const askDeleteMember = (index: number) => setConfirmDeleteIndex(index);
    const cancelDelete = () => setConfirmDeleteIndex(null);

    const confirmDeleteMember = async (index: number) => {
        const member = members[index];
        if (member.id) {
            try {
                await axios.delete(`${BASE_URL}/${member.id}`);
            } catch {
                setToastMessage("Erro ao remover membro");
                return;
            }
        }
        setMembers(prev => prev.filter((_, i) => i !== index));
        setConfirmDeleteIndex(null);
    };

    // Pesquisa de membros
    const filteredMembers = members.filter(m =>
        [m.nome ?? "", m.email ?? "", m.funcao ?? ""].some(field =>
            field.toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <div className="flex h-screen relative">
            <Sidebar />
            <main className="flex-1 bg-white rounded-3xl overflow-auto p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-azul-escuro">
                    GERENCIAR MEMBROS
                </h1>

                <div className="flex justify-between mb-6">
                    <input
                        type="text"
                        placeholder="Pesquisar membro..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-2 w-64 rounded-md border border-gray-300"
                    />
                    <button
                        onClick={addMember}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                        + Novo Membro
                    </button>
                </div>

                <div className="space-y-4">
                    {filteredMembers.map((member, index) => (
                        <form
                            key={index}
                            id={`member-form-${index}`}
                            className="bg-[#F5F5F5] rounded-lg shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 transition"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <div className="flex-1 flex flex-col md:flex-row md:gap-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Nome"
                                    value={member.nome}
                                    readOnly={!member.isEditing}
                                    onChange={(e) => handleChange(index, "nome", e.target.value)}
                                    required
                                    className={`flex-1 p-2 rounded-md transition ${member.isEditing
                                        ? "border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        : "border-none outline-none bg-transparent cursor-default"
                                        }`}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={member.email}
                                    readOnly={!member.isEditing}
                                    onChange={(e) => handleChange(index, "email", e.target.value)}
                                    required
                                    className={`flex-1 p-2 rounded-md transition ${member.isEditing
                                        ? "border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        : "border-none outline-none bg-transparent cursor-default"
                                        }`}
                                />
                                <input
                                    type="text"
                                    placeholder="Função"
                                    value={member.funcao}
                                    readOnly={!member.isEditing}
                                    onChange={(e) => handleChange(index, "funcao", e.target.value)}
                                    required
                                    className={`flex-1 p-2 rounded-md transition ${member.isEditing
                                        ? "border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        : "border-none outline-none bg-transparent cursor-default"
                                        }`}
                                />
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0 items-center">
                                {confirmDeleteIndex === index ? (
                                    <>
                                        <span className="mr-2 text-red-600 font-semibold">
                                            Tem certeza que deseja excluir?
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => confirmDeleteMember(index)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Sim
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelDelete}
                                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                                        >
                                            Não
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className={`px-4 py-2 text-white rounded-md h-full ${member.isEditing
                                                ? "bg-blue-600 hover:bg-blue-700"
                                                : "bg-green-600 hover:bg-green-700"
                                                }`}
                                            onClick={() => toggleEdit(index)}
                                        >
                                            {member.isEditing ? "Salvar" : "Editar"}
                                        </button>
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 h-full"
                                            onClick={() => askDeleteMember(index)}
                                        >
                                            Excluir
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    ))}
                </div>

                {toastMessage && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded shadow-lg pointer-events-none select-none animate-fadeInOut">
                        {toastMessage}
                    </div>
                )}
            </main>

            <style>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          10%, 90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(10px);
          }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease forwards;
        }
      `}</style>
            <style>{`
  .custom-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE e Edge */
  }
  .custom-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari e Opera */
  }
`}</style>
        </div>
    );
}
