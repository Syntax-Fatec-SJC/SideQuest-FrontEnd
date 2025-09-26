import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenUtils, userUtils } from '../utils/auth';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Pega o token da URL
        const token = searchParams.get('token');
        const nome = searchParams.get('nome');
        const email = searchParams.get('email');
        
        console.log('Callback OAuth2 recebido');
        console.log('Token presente:', !!token);
        console.log('Nome:', nome);
        console.log('Email:', email);

        if (token) {
          // Salva o token
          tokenUtils.saveToken(token);
          
          // Salva dados do usuário se disponíveis
          if (nome && email) {
            userUtils.saveUser({ 
              id: '', // Será preenchido pelo backend
              nome: nome,
              email: email,
              provedor: 'google',
              ativo: true,
              dataCriacao: new Date().toISOString()
            });
          }

          console.log('Login OAuth2 realizado com sucesso');
          console.log('Redirecionando para /projetos...');
          
          // Redireciona para projetos
          navigate('/projetos', { replace: true });
        } else {
          console.error('Token não encontrado na URL de callback');
          // Redireciona de volta para login em caso de erro
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Erro no callback OAuth2:', error);
        // Redireciona de volta para login em caso de erro
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf00] mx-auto mb-4"></div>
        <p className="text-lg">Finalizando login com Google...</p>
        <p className="text-sm text-gray-400 mt-2">Aguarde um momento</p>
      </div>
    </div>
  );
};

export default AuthCallback;