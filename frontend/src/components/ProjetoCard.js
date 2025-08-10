"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaGithub, FaExternalLinkAlt, FaEllipsisV, FaTrash, FaEdit } from 'react-icons/fa';

// O componente agora recebe uma nova propriedade: a função 'onDelete'
export default function ProjetoCard({ projeto, onDelete }) {
    const [menuAberto, setMenuAberto] = useState(false);

    const handleDelete = async () => {
        // Pede confirmação antes de uma ação destrutiva
        if (!window.confirm(`Tem certeza que deseja apagar o projeto "${projeto.titulo}"?`)) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/projetos/${projeto.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                onDelete(projeto.id); // Avisa o componente pai que este projeto foi apagado
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro ao apagar projeto:', error);
            alert('Não foi possível apagar o projeto.');
        }
    };
    
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-lg relative">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-cyan-800 pr-4">{projeto.titulo}</h3>
                <button onClick={() => setMenuAberto(!menuAberto)} className="p-2 rounded-full hover:bg-gray-200">
                    <FaEllipsisV className="text-gray-500" />
                </button>
            </div>

            {/* Menu Dropdown de Opções */}
            {menuAberto && (
                <div className="absolute top-12 right-4 bg-white border rounded-md shadow-lg z-10 w-36">
                    {/* BOTÃO DE EDITAR AGORA É UM LINK */}
                    <Link href={`/projetos/editar/${projeto.id}`} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <FaEdit className="mr-2"/> Editar
                    </Link>
                    <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
                        <FaTrash className="mr-2"/> Excluir
                    </button>
                </div>
            )}

            <p className="text-gray-600 my-2 text-sm">{projeto.descricao}</p>
            <div className="flex items-center space-x-4 mt-4">
                {projeto.link_repositorio && (
                    <a href={projeto.link_repositorio} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-cyan-700 transition-colors">
                        <FaGithub className="mr-2" />
                        <span>Repositório</span>
                    </a>
                )}
                {projeto.link_produção && (
                    <a href={projeto.link_producao} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-cyan-700 transition-colors">
                        <FaExternalLinkAlt className="mr-2" />
                        <span>Ver Online</span>
                    </a>
                )}
            </div>
        </div>
    );
}