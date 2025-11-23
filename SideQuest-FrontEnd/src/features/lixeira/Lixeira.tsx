import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../shared/components/Sidebar';
import { useToast } from '../../shared/hooks/useToast';

interface DeletedItem {
    id: string;
    titulo: string;
    descricao?: string;
    deletadoEm?: string;
}

const USE_MOCK = true;

function delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function seedMockIfNeeded() {
    const key = 'mockTrash';
    if (!localStorage.getItem(key)) {
        const seed: DeletedItem[] = [];
        localStorage.setItem(key, JSON.stringify(seed));
    }
}

async function mockFetchTrash(): Promise<DeletedItem[]> {
    seedMockIfNeeded();
    await delay(300);
    const raw = localStorage.getItem('mockTrash') || '[]';
    return JSON.parse(raw) as DeletedItem[];
}

async function mockRestore(id: string): Promise<void> {
    await delay(200);
    const raw = localStorage.getItem('mockTrash') || '[]';
    const items = JSON.parse(raw) as DeletedItem[];
    const remaining = items.filter(i => i.id !== id);
    localStorage.setItem('mockTrash', JSON.stringify(remaining));
}



export default function Lixeira() {
    const [itens, setItens] = useState<DeletedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const showToast = useCallback((type: 'success' | 'error', message: string) => {
        type ToastLike = {
            success?: (message: string) => void;
            error?: (message: string) => void;
            show?: (opts: { type: 'success' | 'error'; message: string }) => void;
            notify?: (type: 'success' | 'error' | string, message: string) => void;
        };

        const toastLike = toast as unknown as ToastLike;
        if (!toastLike) return;
        const fn = toastLike[type];
        if (typeof fn === 'function') {
            fn(message);
            return;
        }
        if (typeof toastLike.show === 'function') {
            toastLike.show({ type, message });
            return;
        }
        if (typeof toastLike.notify === 'function') {
            toastLike.notify(type, message);
            return;
        }
        console.log(`${type.toUpperCase()}: ${message}`);
    }, [toast]);

    const carregarLixeira = useCallback(async () => {
        setLoading(true);
        try {
            if (USE_MOCK) {
                const data = await mockFetchTrash();
                setItens(data);
                return;
            }
            const res = await fetch('/api/lixeira');
            if (!res.ok) throw new Error('Erro ao carregar lixeira');
            const data: DeletedItem[] = await res.json();
            setItens(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            showToast('error', message || 'Falha ao carregar lixeira');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        carregarLixeira();
    }, [carregarLixeira]);

    const restaurar = useCallback(async (id: string) => {
        if (!confirm('Restaurar este item?')) return;
        try {
            if (USE_MOCK) {
                await mockRestore(id);
                setItens(prev => prev.filter(i => i.id !== id));
                showToast('success', 'Item restaurado (mock)');
                return;
            }
            const res = await fetch(`/api/lixeira/${id}/restaurar`, { method: 'POST' });
            const text = await res.text();
            let body: unknown = text;
            try {
                body = text ? JSON.parse(text) : text;
            } catch {
                // Ignore JSON parse errors — response may be plain text
            }
            if (!res.ok) {
                let serverMsg = `Status ${res.status}`;
                if (typeof body === 'string') {
                    serverMsg = body;
                } else if (body && typeof body === 'object' && 'message' in (body as Record<string, unknown>)) {
                    const msg = (body as Record<string, unknown>).message;
                    if (typeof msg === 'string') serverMsg = msg;
                }
                throw new Error(serverMsg);
            }
            setItens(prev => prev.filter(i => i.id !== id));
            showToast('success', 'Item restaurado');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error('Erro ao restaurar:', message);
            showToast('error', message || 'Erro ao restaurar item');
        }
    }, [showToast]);


    return (
        <div className="flex h-screen relative overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col bg-white rounded-3xl p-4 sm:p-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4">
                <div className="max-w-4xl mx-auto">
                    <header className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-azul-escuro">Lixeira</h1>
                        </div>
                    </header>

                    {loading ? (
                        <p>Carregando...</p>
                    ) : itens.length === 0 ? ( <h1 className='text-center text-gray-500 mt-10'>
                            Nenhum item na lixeira.
                            </h1>
                    ) : (
                        <ul className="space-y-3">
                            {itens.map(item => (
                                <li key={item.id} className="p-4 bg-white rounded shadow flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{item.titulo}</h3>
                                        {item.descricao && <p className="text-sm text-gray-600">{item.descricao}</p>}
                                        {item.deletadoEm && <p className="text-xs text-gray-400 mt-1">Removido em: {new Date(item.deletadoEm).toLocaleString()}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => restaurar(item.id)} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Restaurar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}
