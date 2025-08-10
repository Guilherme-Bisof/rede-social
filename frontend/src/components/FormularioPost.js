// Arquivo: frontend/src/components/FormularioPost.js
"use client";

import { useState } from 'react';

export default function FormularioPost() {
    const [conteudo, setConteudo] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!conteudo.trim()) {
            alert('Você não pode criar uma publicação vazia.');
            return;
        }

        try {
            // 1. Pega o token que guardamos no login
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Você não está autenticado. Por favor, faça login novamente.');
                return;
            }
            
            // 2. Adiciona o token ao cabeçalho da requisição
            const response = await fetch('http://localhost:3001/api/publicacoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ conteudo: conteudo }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                setConteudo(''); // Limpa a caixa de texto após o sucesso
                // TODO: Futuramente, vamos atualizar o feed em tempo real em vez de mostrar um alerta.
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            alert('Não foi possível conectar ao servidor.');
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md max-w-2xl mx-auto my-8">
            <form onSubmit={handleSubmit}>
                <div className="flex items-start space-x-4">
                    {/* Avatar do usuário (vamos deixar estático por enquanto) */}
                    <img src="/assets/img/default-avatar.jpg" alt="Seu avatar" className="w-12 h-12 rounded-full" />

                    <textarea
                        value={conteudo}
                        onChange={(e) => setConteudo(e.target.value)}
                        placeholder="No que você está pensando, Guilherme?"
                        className="w-full p-2 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        rows="3"
                    ></textarea>
                </div>
                <div className="flex justify-end mt-4">
                    {/* TODO: Adicionar botão para upload de imagem */}
                    <button type="submit" className="bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-cyan-800 transition-colors">
                        Publicar
                    </button>
                </div>
            </form>
        </div>
    );
}