import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../shared/components/Sidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import useAuth from "../../shared/hooks/useAuth";
import type { EventInput } from "@fullcalendar/core";
import { tarefaService } from "../../services/TarefaService";
import { projetoService } from "../../services/ProjetoService";
import type { Tarefa } from "../../types/Tarefa";
import type { Projeto } from "../../types/Projeto";

export default function Calendario() {
    const { isAutenticado, usuario } = useAuth();
    const navigate = useNavigate();

    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | null>(null);
    const [eventos, setEventos] = useState<EventInput[]>([]);
    const [carregandoProjetos, setCarregandoProjetos] = useState(true);
    const [carregandoEventos, setCarregandoEventos] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [apenasMinhasTarefas, setApenasMinhasTarefas] = useState(false);

    const irParaLogin = () => navigate("/acesso");

    useEffect(() => {
        if (!isAutenticado || !usuario) {
            setCarregandoProjetos(false);
            return;
        }

        const buscarProjetos = async () => {
            try {
                setErro(null);
                const projetosData = await projetoService.listarProjetosDoUsuario();
                setProjetos(projetosData);
            } catch (error) {
                console.error("Falha ao buscar projetos:", error);
                setErro("Não foi possível carregar os projetos.");
            } finally {
                setCarregandoProjetos(false);
            }
        };

        void buscarProjetos();
    }, [isAutenticado, usuario]);

    useEffect(() => {
        if (!isAutenticado || !projetoSelecionadoId) {
            setEventos([]);
            return;
        }

        const carregarEventos = async () => {
            setCarregandoEventos(true);
            setErro(null);
            try {
                let tarefas = await tarefaService.listarTarefasDoProjeto(projetoSelecionadoId);

                if (apenasMinhasTarefas && usuario) {
                    tarefas = tarefas.filter(tarefa => 
                        (tarefa as any).usuarioIds && (tarefa as any).usuarioIds.includes(usuario.id.toString())
                    );
                }

                const dadosFormatados: EventInput[] = tarefas
                    .filter(tarefa => (tarefa as any).prazoFinal) 
                    .map((tarefa: Tarefa) => {
                        const dataCorrigida = (tarefa as any).prazoFinal.split('T')[0];

                        return {
                            id: tarefa.id,
                            title: tarefa.nome,
                            start: dataCorrigida, 
                            color: String(tarefa.status) === "Concluído" ? "#22C55E" : "#FACC15",
                            allDay: true
                        };
                    });
                setEventos(dadosFormatados);
            } catch (error) {
                console.error("Falha ao carregar eventos do calendário:", error);
                setErro("Não foi possível carregar as tarefas deste projeto.");
                setEventos([]);
            } finally {
                setCarregandoEventos(false);
            }
        };

        void carregarEventos();
    }, [isAutenticado, projetoSelecionadoId, apenasMinhasTarefas, usuario]);
    if (!isAutenticado) {
        return (
            <div className="flex h-screen relative overflow-hidden">
                <Sidebar />
                <main className="flex-1 bg-white rounded-3xl p-8 shadow-lg mt-8 mb-8 mx-4 flex justify-center items-center">
                    <div className="text-center text-red-600 flex flex-col gap-4">
                        <span>Você precisa estar logado para ver o calendário.</span>
                        <button
                            onClick={irParaLogin}
                            className="px-4 py-2 bg-azul-escuro text-white rounded hover:bg-azul-claro transition"
                        >
                            Fazer login
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen relative">
            <Sidebar />
            <main className="flex-1 flex flex-col bg-white rounded-3xl p-4 sm:p-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-azul-escuro">
                        CALENDÁRIO
                    </h1>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={apenasMinhasTarefas}
                                onChange={(e) => setApenasMinhasTarefas(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-azul-escuro focus:ring-azul-claro"
                            />
                            <span className="text-sm font-medium text-gray-700">Apenas minhas tarefas</span>
                        </label>

                        {carregandoProjetos ? (
                            <p className="text-gray-500">Carregando projetos...</p>
                        ) : projetos.length > 0 ? (
                            <select
                                value={projetoSelecionadoId ?? ""}
                                onChange={(e) => setProjetoSelecionadoId(e.target.value || null)}
                                className="p-2 border rounded-md shadow-sm focus:ring-azul-escuro focus:border-azul-escuro"
                            >
                                <option value="">Selecione um projeto</option>
                                {projetos.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-gray-500">Nenhum projeto encontrado.</p>
                        )}
                    </div>
                </div>

                {erro && <div className="text-center text-red-500 mb-4">{erro}</div>}

                {carregandoEventos ? (
                    <div className="text-center text-gray-500 mt-10">Carregando calendário...</div>
                ) : !projetoSelecionadoId ? (
                    <div className="text-center text-gray-500 mt-10">
                        Selecione um projeto para visualizar as tarefas no calendário.
                    </div>
                ) : (
                    <div
                        className="shadow overflow-hidden w-full flex-1 min-h-0 rounded-xl"
                    >
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek,timeGridDay",
                            }}
                            buttonText={{ today: "Hoje", month: "Mês", week: "Semana", day: "Dia" }}
                            height="100%"
                            locale="pt-br"
                            events={eventos}
                            dayMaxEventRows
                            contentHeight="auto"
                            displayEventTime={false}
                        />
                    </div>
                )}

                <style>{`
                    .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 600; color: #2563EB; }
                    .fc .fc-button { padding: 0.25rem 0.75rem; border-radius: 0.5rem; background-color: #2563EB; color: white; font-weight: 500; transition: background-color 0.2s; }
                    .fc .fc-button:hover { background-color: #3c75f0ff; }
                    .fc .fc-button:disabled { opacity: 0.5; cursor: not-allowed; }
                    @media (max-width: 640px) {
                        .fc .fc-toolbar-chunk { flex-direction: column; gap: 0.5rem; text-align: center; }
                        .fc .fc-button { font-size: 0.875rem; padding: 0.2rem 0.5rem; }
                        .fc .fc-toolbar-title { font-size: 1rem; }
                    }
                `}</style>
            </main>
        </div>
    );
}
