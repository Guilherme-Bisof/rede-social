"use client"

import { useState, useEffect } from 'react';
import Cabecalho from '@/components/Cabecalho';
import FormularioPost from '@/components/FormularioPost';
import Publicacao from '@/components/Publicacao';

export default function InicioPage() {
    
    const [publicacoes, setPublicacoes] = useState([]);
  
    
    useEffect(() => {
      const buscarPublicacoes = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/publicacoes');
          if (response.ok) {
            const data = await response.json();
            setPublicacoes(data); // Armazena os dados no nosso estado
          }
        } catch (error) {
          console.error('Erro ao buscar publicações:', error);
          alert('Não foi possível carregar o feed.');
        }
      };
  
      buscarPublicacoes();
    }, []); // O array vazio [] garante que a busca aconteça apenas uma vez
  
    return (
      <div className="bg-gray-100 min-h-screen">
        <Cabecalho />
  
        <main className="max-w-7xl mx-auto">
          <FormularioPost />
  
          {/* 4. Mapeie o array de publicações para renderizar cada uma */}
          <div className="mt-8">
            {publicacoes.map((post) => (
              <Publicacao key={post.id} post={post} />
            ))}
          </div>
  
          {/* Mensagem para quando não houver publicações */}
          {publicacoes.length === 0 && (
            <div className="text-center p-8">
              <h2 className="text-2xl font-semibold text-gray-500">Nenhuma publicação ainda.</h2>
              <p className="mt-2 text-gray-400">Seja o primeiro a compartilhar algo!</p>
            </div>
          )}
        </main>
      </div>
    );
  }