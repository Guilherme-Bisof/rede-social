"use client";

import Link from "next/link";
import {FaUser, FaFolderOpen, FaNewspaper, FaSignOutAlt, FaSearch } from 'react-icons/fa';

export default function Cabecalho() {
    return(
        <header className="bg-gradient-to-r from-cyan-800 to-cyan600 text-white -p4 shadow-md flex flex-wrap items-center justify-between gap-4">
            {/* Logo */}
            <h1 className="text-2xl font-bold">
                <Link href="/inicio">Akademia</Link>
            </h1>

            {/* Barra de busca */}
            <div className="relative flex-grow max-w-xl">
                <input type="text" placeholder="Buscar perfis..." className="w-full py-2 pl-4 pr-10 rounded-full text-gray-800 focus:outline-none"/>
                <button className="absolute right-0 top-0 mt-2 mr-2 p-1 rounded-full hover:bg-gray-200">
                    <FaSearch className="text-cyan-700" size={20}/>
                </button>
            </div>

            {/* Links de Navegação */}
            <nav className="flex items-center gap-2">
                <Link href="/perfil" className="nav-link">
                    <FaUser className="mr-1"/>
                    <span>Perfil</span>
                </Link>
                <Link href="/projetos" className="nav-link">
                    <FaUser className="mr-1"/>
                    <span>Projetos</span>
                </Link>
                <Link href="#publicacoes" className="nav-link">
                    <FaUser className="mr-1"/>
                    <span>Publicações</span>
                </Link>
                {/* TODO: A lógica de sair (logout) será implementada depois */}
                <button className="nav-link bg-red-500 hover:bg-red-600">
                    <FaSignOutAlt className="mr-1" />
                    <span>Sair</span>
                </button>
            </nav>
        </header>
    )
}