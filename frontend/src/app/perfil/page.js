"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cabecalho from '@/components/Cabecalho';
import ProjetoCard from '@/components/ProjetoCard';

export default function PerfilPage() {
    const [perfil, setPerfil] = useState(null);
    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const inputFileRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/');
            return;
        }
        const user = JSON.parse(userData);
        
        const fetchData = async () => {
            try {
                const [perfilResponse, projetosResponse] = await Promise.all([
                    fetch(`http://localhost:3001/api/usuarios/${user.id}`),
                    fetch(`http://localhost:3001/api/usuarios/${user.id}/projetos`)
                ]);

                if (!perfilResponse.ok) throw new Error('Usuário não encontrado');
                
                const perfilData = await perfilResponse.json();
                const projetosData = await projetosResponse.json();

                setPerfil(perfilData);
                setProjetos(projetosData);
            } catch (error) {
                console.error('Erro ao buscar dados do perfil:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('foto_perfil', file);

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        try {
            const response = await fetch(`http://localhost:3001/api/usuarios/${user.id}/foto`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                setPerfil(prevPerfil => ({ ...prevPerfil, foto_perfil: result.foto_perfil }));
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro no upload da foto:', error);
            alert('Não foi possível fazer o upload da foto.');
        }
    };

    const handleImageClick = () => {
        inputFileRef.current.click();
    };

    const handleDeleteProjeto = (idDoProjetoApagado) => {
        setProjetos(projetos.filter(p => p.id !== idDoProjetoApagado));
    };

    if (loading) return <p>Carregando perfil...</p>;
    if (!perfil) return <p>Não foi possível carregar o perfil.</p>;

    const avatarSrc = (perfil.foto_perfil && perfil.foto_perfil.startsWith('foto_perfil'))
      ? `http://localhost:3001/uploads/${perfil.foto_perfil}`
      : `/assets/img/default-avatar.jpg`;

    // ESTE É O BLOCO DE RENDERIZAÇÃO COMPLETO E CORRETO
    return (
        <div className="bg-gray-100 min-h-screen">
            <Cabecalho />
            <main className="p-8 max-w-4xl mx-auto">
                {/* CARD DO PERFIL PRINCIPAL */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-6">
                            <input 
                                type="file" 
                                ref={inputFileRef} 
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg"
                            />
                            <img 
                                src={avatarSrc}
                                alt={`Foto de ${perfil.nome_completo}`}
                                className="w-32 h-32 rounded-full border-4 border-cyan-600 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={handleImageClick}
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{perfil.nome_completo}</h1>
                                <p className="text-md text-gray-500">@{perfil.nome_usuario}</p>
                                <span className="inline-block bg-cyan-100 text-cyan-800 text-sm font-semibold mt-2 px-3 py-1 rounded-full">
                                    {perfil.funcao}
                                </span>
                            </div>
                        </div>
                        <Link href="/perfil/editar" className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm whitespace-nowrap">
                            Editar Perfil
                        </Link>
                    </div>
                    
                    {/* SEÇÃO DE HABILIDADES RESTAURADA */}
                    {perfil.habilidades && perfil.habilidades.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-700 mb-3">Habilidades</h2>
                            <div className="flex flex-wrap gap-2">
                                {perfil.habilidades.map((habilidade, index) => (
                                    <span key={index} className="bg-cyan-100 text-cyan-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        {habilidade}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SEÇÃO DE PROJETOS RESTAURADA */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Projetos</h2>
                        <Link href="/projetos/novo" className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors text-sm">
                            + Adicionar Projeto
                        </Link>
                    </div>
                    {projetos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projetos.map(projeto => (
                                <ProjetoCard key={projeto.id} projeto={projeto}
                                onDelete={handleDeleteProjeto} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 bg-white p-6 rounded-lg shadow-md">Nenhum projeto adicionado ainda.</p>
                    )}
                </div>
            </main>
        </div>
    );
}