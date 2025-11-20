import Sidebar from "../../../shared/components/Sidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ProjetoSelect } from "./ui/SelecionaProjetoCalendario";
import { CheckboxFiltro } from "./ui/FiltroCalendario";
import { ToastContainer } from "../../../shared/components/ui/ToastContainer";
import type { Projeto } from "../../../types/Projeto";
import type { EventInput } from "@fullcalendar/core";

interface CalendarioViewProps {
  projetos: Projeto[];
  eventos: EventInput[];
  carregandoProjetos: boolean;
  carregandoEventos: boolean;
  projetoSelecionadoId: string | null;
  apenasMinhasTarefas: boolean;
  onChangeProjeto: (id: string | null) => void;
  onToggleApenasMinhasTarefas: (value: boolean) => void;
}

export function CalendarioView({
  projetos,
  eventos,
  carregandoProjetos,
  carregandoEventos,
  projetoSelecionadoId,
  apenasMinhasTarefas,
  onChangeProjeto,
  onToggleApenasMinhasTarefas,
}: CalendarioViewProps) {
  return (
    <div className="flex h-screen relative overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col bg-white rounded-3xl px-0 sm:px-4 py-1 sm:py-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4">
        <ToastContainer />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-azul-escuro">
            CALENDÁRIO
          </h1>

          <div className="flex items-center gap-4">
            <CheckboxFiltro
              label="Apenas minhas tarefas"
              checked={apenasMinhasTarefas}
              onChange={onToggleApenasMinhasTarefas}
            />
            <ProjetoSelect
              projetos={projetos}
              valorSelecionado={projetoSelecionadoId}
              onChange={onChangeProjeto}
              carregando={carregandoProjetos}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 min-w-0 mt-10 overflow-hidden rounded-xl shadow text-gray-500 text-center">
          {carregandoEventos ? (
            "Carregando calendário..."
          ) : (
            <div className="w-full h-full overflow-x-auto px-0">
              <FullCalendar
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
                dayMaxEventRows={1}
                moreLinkClick="popover"
                moreLinkContent={(arg) => `+${arg.num} mais`}
                contentHeight="auto"
                displayEventTime={false}
                titleFormat={{
                  year: "numeric",
                  month: window.innerWidth < 640 ? "short" : "long", 
                }}
              />

            </div>


          )}
        </div>
      </main>
    </div>
  );
}
