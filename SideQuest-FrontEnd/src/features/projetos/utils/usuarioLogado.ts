export function obterUsuarioLogadoId(): string | null {
  const rawNovo = localStorage.getItem("usuarioLogado");
  if (rawNovo) {
    try { 
      return JSON.parse(rawNovo).id as string; 
    } catch { 
      /* empty */ 
    }
  }
  
  const rawAntigo = localStorage.getItem("usuario");
  if (rawAntigo) {
    try { 
      return JSON.parse(rawAntigo).id as string; 
    } catch { 
      /* empty */ 
    }
  }
  
  return localStorage.getItem("usuarioId");
}

export function obterUsuarioLogadoEmail(): string | null {
  const rawNovo = localStorage.getItem("usuarioLogado");
  if (rawNovo) {
    try { 
      const usuario = JSON.parse(rawNovo);
      return usuario.email?.toLowerCase() || null;
    } catch { 
      /* empty */ 
    }
  }
  
  const rawAntigo = localStorage.getItem("usuario");
  if (rawAntigo) {
    try { 
      const usuario = JSON.parse(rawAntigo);
      return usuario.email?.toLowerCase() || null;
    } catch { 
      /* empty */ 
    }
  }
  
  return null;
}