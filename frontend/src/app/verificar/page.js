"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerificarPage(){
    // Hooks 
    const searchParams = useSearchParams();
    const [message, setMessage] = useState('Verificando sua conta, por favor, aguarde...');
    const [sucess, setSucess] = useState(false);

    // o useEffect é usado para executar assim que a pagina carrega.
    useEffect(() => {
        const token = searchParams.get('token');

        if (token){
            // Função para enviar o token para a API
            const verificarToken = async () => {
                try {
                    const response = await fetch(`http://localhost:3001/api/verificar?token=${token}`);
                    const result = await response.json();

                    setMessage(result.message);
                    if (response.ok) {
                        setSucess(true);
                    }
                } catch (error) {
                    setMessage('Erro ao conectar com o servidor. Tente novamente mais tarde.');
                }
            };

            verificarToken();
        } else {
            setMessage ('Nenhum token de verificação encontrado.');
        }
    }, [searchParams]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                <h1 className="text-2xl font-bold mb-4">Status da Verificação</h1>
                <p className="text-gray-700 mb-6">{message}</p>

                {/* Mostra um link para a página de login em caso de sucesso */}
                {sucess && (
                    <Link href="/" className="form-button">
                        Ir para o Login
                    </Link>
                )}
            </div>
        </main>
    );
}