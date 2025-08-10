"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cabecalho from '@/components/Cabecalho';

export default function EditarProjetoPage() {
    const router = useRouter();
    const params = useParams(); // Hook para pegar o [id] da URL
    const { id } = params;

    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        link_repositorio: '',
        link_producao: ''
    });
    const [loading, setLoading] = useState(true);

    // useEffect para buscar os dados do projeto ao carregar a página
    useEffect(() => {
        if (!id) return; // Se não houver ID na URL, não faz nada

        const buscarProjeto = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/projetos/${id}`);
                if (!response.ok) throw new Error('Projeto não encontrado');
                const data = await response.json();
                setFormData(data); // Preenche o formulário com os dados do projeto
            } catch (error) {
                console.error("Erro ao buscar projeto:", error);
                alert('Não foi possível carregar os dados do projeto.');
                router.push('/perfil');
            } finally {
                setLoading(false);
            }
        };
        buscarProjeto();
    }, [id, router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Função para enviar as atualizações para a API
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/projetos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (response.ok) {
                alert('Projeto atualizado com sucesso!');
                router.push('/perfil');
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar projeto:', error);
            alert('Não foi possível conectar ao servidor.');
        }
    };

    if (loading) return <p>Carregando projeto...</p>;

    return (
        <div className="bg-gray-100 min-h-screen">
            <Cabecalho />
            <main className="p-8 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Projeto</h1>
                    <form onSubmit={handleSubmit}>
                       {/* O formulário é idêntico ao de criação */}
                       <div className="mb-4">
                            <label htmlFor="titulo" className="block text-gray-700 font-semibold mb-2">Título do Projeto</label>
                            <input type="text" name="titulo" id="titulo" value={formData.titulo || ''} onChange={handleChange} className="form-input" required />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="descricao" className="block text-gray-700 font-semibold mb-2">Descrição</label>
                            <textarea name="descricao" id="descricao" value={formData.descricao || ''} onChange={handleChange} className="form-input" rows="4"></textarea>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="link_repositorio" className="block text-gray-700 font-semibold mb-2">Link do Repositório (GitHub, etc.)</label>
                            <input type="url" name="link_repositorio" id="link_repositorio" value={formData.link_repositorio || ''} onChange={handleChange} className="form-input" />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="link_producao" className="block text-gray-700 font-semibold mb-2">Link Online (se houver)</label>
                            <input type="url" name="link_producao" id="link_producao" value={formData.link_producao || ''} onChange={handleChange} className="form-input" />
                        </div>
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