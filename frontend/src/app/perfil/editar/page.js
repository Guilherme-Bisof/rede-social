"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cabecalho from '@/components/Cabecalho';

export default function EditarPerfilPage() {
    const router = useRouter();
    const [habilidadesStr, setHabilidadesStr] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // useEffect para buscar os dados do usuário ao carregar a página
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/');
            return;
        }
        const loggedInUser = JSON.parse(userData);
        setUser(loggedInUser);

        const buscarPerfil = async () => {
            const response = await fetch(`http://localhost:3001/api/usuarios/${loggedInUser.id}`);
            const data = await response.json();
            if (data.habilidades) {
                // Transforma o array de habilidades em uma string separada por vírgulas para o campo de texto
                setHabilidadesStr(data.habilidades.join(', '));
            }
            setLoading(false);
        };

        buscarPerfil();
    }, [router]);

    // Função para lidar com o envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Transforma a string de volta em um array, limpando espaços em branco
        const habilidadesArray = habilidadesStr.split(',').map(skill => skill.trim()).filter(skill => skill);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3001/api/usuarios/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ habilidades: habilidadesArray })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Perfil atualizado com sucesso!');
                router.push('/perfil'); // Redireciona de volta para a página de perfil
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Não foi possível conectar ao servidor.');
        }
    };

    if (loading) return <p>Carregando...</p>;

    return (
        <div className="bg-gray-100 min-h-screen">
            <Cabecalho />
            <main className="p-8 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Perfil</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="habilidades" className="block text-gray-700 font-semibold mb-2">
                                Habilidades
                            </label>
                            <input
                                type="text"
                                id="habilidades"
                                value={habilidadesStr}
                                onChange={(e) => setHabilidadesStr(e.target.value)}
                                placeholder="JavaScript, React, Node.js, etc."
                                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separe as habilidades por vírgula.</p>
                        </div>
                        {/* Futuramente, outros campos do perfil virão aqui */}
                        <div className="mt-6">
                            <button type="submit" className="w-full bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-800 transition-colors">
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}