import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../shared/components/Sidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import useAuth from "../../shared/hooks/useAuth";
import type { EventInput } from "@fullcalendar/core";

export default function Calendario() {
    const { isAutenticado } = useAuth();
    const [eventos, setEventos] = useState<EventInput[]>([]);
    const [carregando, setCarregando] = useState(true);
    const navigate = useNavigate();

    const irParaLogin = () => navigate("/acesso");

    useEffect(() => {
        if (!isAutenticado) {
            setCarregando(false);
            return;
        }

        const carregarEventos = async () => {
            const dados: EventInput[] = [
                { id: "1", title: "Criar Figma", start: "2025-10-01", color: "#3B82F6" },
                { id: "2", title: "Desenvolver Front-end", start: "2025-10-02", color: "#FACC15" },
                { id: "3", title: "Planejar Banco de Dados", start: "2025-10-03", color: "#EF4444" },
                { id: "4", title: "Revisão Wireframe", start: "2025-10-05", color: "#22C55E" },
                { id: "5", title: "Testes QA", start: "2025-10-06", color: "#FBBF24" },
                { id: "6", title: "Deploy Produção", start: "2025-10-09", color: "#22C55E" },
                { id: "7", title: "Validação Cliente", start: "2025-10-12", color: "#3B82F6" },
                { id: "8", title: "Documentação", start: "2025-10-15", color: "#FACC15" },
            ];

            setTimeout(() => {
                setEventos(dados);
                setCarregando(false);
            }, 400);
        };

        void carregarEventos();
    }, [isAutenticado]);

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
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-azul-escuro">
                    CALENDÁRIO
                </h1>

                {carregando ? (
                    <div className="text-center text-gray-500 mt-10">Carregando calendário...</div>
                ) : (
                    <div
                        className="shadow overflow-hidden w-full"
                        style={{
                            height: "calc(90vh - 155px)",
                            borderBottomLeftRadius: "2rem",
                            borderBottomRightRadius: "2rem",
                            borderTopLeftRadius: "0",
                            borderTopRightRadius: "0"
                        }}
                    >            <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek,timeGridDay",
                            }}
                            buttonText={{
                                today: "Hoje",
                                month: "Mês",
                                week: "Semana",
                                day: "Dia",
                            }}
                            height="100%"
                            locale="pt-br"
                            events={eventos}
                            dayMaxEventRows
                            contentHeight="auto"
                        />
                    </div>
                )}

                <style>{`
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2563EB;
          }

          .fc .fc-button {
            padding: 0.25rem 0.75rem;
            border-radius: 0.5rem;
            background-color: #2563EB;
            color: white;
            font-weight: 500;
            transition: background-color 0.2s;
          }

          .fc .fc-button:hover {
            background-color: #3c75f0ff;
          }

          .fc .fc-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          @media (max-width: 640px) {
            .fc .fc-toolbar-chunk {
              flex-direction: column;
              gap: 0.5rem;
              text-align: center;
            }

            .fc .fc-button {
              font-size: 0.875rem;
              padding: 0.2rem 0.5rem;
            }

            .fc .fc-toolbar-title {
              font-size: 1rem;
            }
          }
        `}</style>
            </main>
        </div>
    );
}
