// Arquivo: frontend/src/components/Publicacao.js
"use client";

export default function Publicacao({ post }) {
    // Formata a data para um formato mais amigável
    const dataFormatada = new Date(post.data_criacao).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="bg-white p-4 rounded-lg shadow-md max-w-2xl mx-auto mb-6">
            {/* Cabeçalho do Post */}
            <div className="flex items-center mb-4">
                <img 
                    src={`/assets/img/${post.foto_perfil || 'default-avatar.jpg'}`} 
                    alt={`Avatar de ${post.nome_completo}`}
                    className="w-12 h-12 rounded-full mr-4" 
                />
                <div>
                    <p className="font-bold text-gray-800">{post.nome_completo}</p>
                    <p className="text-sm text-gray-500">{dataFormatada}</p>
                </div>
            </div>

            {/* Conteúdo do Post */}
            {post.conteudo && <p className="text-gray-700 mb-4">{post.conteudo}</p>}

            {/* Imagem do Post (se houver) */}
            {post.imagem_url && (
                <div className="rounded-lg overflow-hidden">
                    <img src={post.imagem_url} alt="Imagem da publicação" className="w-full" />
                </div>
            )}
        </div>
    );
}