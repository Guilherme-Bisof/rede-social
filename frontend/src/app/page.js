"use client";

import { useState } from 'react';
// 1. IMPORTAR O useRouter
import { useRouter } from 'next/navigation'; 
import { FaGoogle, FaLinkedinIn, FaGithub, FaFacebookF } from 'react-icons/fa';

export default function LoginPage() {
  // 2. INICIALIZAR O ROUTER
  const router = useRouter(); 
  
  const [isActive, setIsActive] = useState(false);

  const [registerFormData, setRegisterFormData] = useState({
    nome: '',
    usuario: '',
    email: '',
    senha: '',
    funcao: 'Aluno'
  });
  
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    senha: ''
  });

  const handleRegisterChange = (e) => {
    setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value });
  };
  const handleLoginChange = (e) => {
    setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerFormData),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setIsActive(false);
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      alert("Não foi possível conectar ao servidor.");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginFormData),
      });
      const result = await response.json();

      if (response.ok) {
        // Salva o token no armazenamento local do navegador
        localStorage.setItem('token', result.token);

        localStorage.setItem('user', JSON.stringify(result.user));

        router.push('/inicio'); 
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      alert("Não foi possível conectar ao servidor.");
    }
  };

  const handleRegisterClick = () => { setIsActive(true); };
  const handleLoginClick = () => { setIsActive(false); };

  return (
    // O resto do seu JSX continua o mesmo
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-gray-200 to-blue-200 p-4">
      <div className="relative w-full max-w-4xl min-h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex absolute top-0 left-0 h-full w-full">
          <div className="w-1/2 flex flex-col items-center justify-center p-12">
            <form onSubmit={handleLoginSubmit} className="w-full">
              <h1 className="font-bold text-3xl mb-4 text-center">Entrar</h1>
              <div className="flex my-4 justify-center"> <a href="#" className="social-icon"><FaGoogle /></a> <a href="#" className="social-icon"><FaLinkedinIn /></a> <a href="#" className="social-icon"><FaGithub /></a> <a href="#" className="social-icon"><FaFacebookF /></a> </div>
              <span className="text-sm mb-4 text-center block">ou use seu email e senha</span>
              <input name="email" type="email" placeholder="Email" className="form-input" value={loginFormData.email} onChange={handleLoginChange} required />
              <input name="senha" type="password" placeholder="Senha" className="form-input" value={loginFormData.senha} onChange={handleLoginChange} required />
              <a href="#" className="text-xs my-3 block text-center">Esqueceu sua senha?</a>
              <button type="submit" className="form-button w-full">Entrar</button>
            </form>
          </div>
          <div className="w-1/2 flex flex-col items-center justify-center p-12">
            <form onSubmit={handleRegisterSubmit} className="w-full">
              <h1 className="font-bold text-3xl mb-4 text-center">Criar Conta</h1>
              <div className="flex my-4 justify-center"> <a href="#" className="social-icon"><FaGoogle /></a> <a href="#" className="social-icon"><FaLinkedinIn /></a> <a href="#" className="social-icon"><FaGithub /></a> <a href="#" className="social-icon"><FaFacebookF /></a> </div>
              <span className="text-sm mb-4 text-center block">ou use seu email para se registrar</span>
              <input name="nome" type="text" placeholder="Nome Completo" value={registerFormData.nome} onChange={handleRegisterChange} className="form-input" required />
              <input name="usuario" type="text" placeholder="Nome de Usuário" value={registerFormData.usuario} onChange={handleRegisterChange} className="form-input" required />
              <input name="email" type="email" placeholder="Email" value={registerFormData.email} onChange={handleRegisterChange} className="form-input" required />
              <input name="senha" type="password" placeholder="Senha" value={registerFormData.senha} onChange={handleRegisterChange} className="form-input" required />
              <select name="funcao" className="form-input my-2" value={registerFormData.funcao} onChange={handleRegisterChange} required>
                <option value="Aluno">Sou Aluno(a)</option>
                <option value="Professor">Sou Professor(a)</option>
              </select>
              <button type="submit" className="form-button mt-4 w-full">Registrar</button>
            </form>
          </div>
        </div>
        <div className={`absolute top-0 w-1/2 h-full bg-gradient-to-r from-cyan-800 to-cyan-600 text-white transition-all duration-700 ease-in-out ${ isActive ? 'left-0' : 'left-1/2' }`} >
          <div className="relative h-full w-full">
            <div className={`absolute top-0 h-full w-full flex flex-col items-center justify-center text-center p-10 transition-opacity duration-700 ease-in-out ${ isActive ? 'opacity-100 z-20' : 'opacity-0 z-10' }`}>
              <h1 className="font-bold text-3xl">Bem-vindo(a) de Volta!</h1>
              <p className="text-sm my-4">Já possui uma conta? Clique no botão abaixo para fazer login.</p>
              <button onClick={handleLoginClick} className="form-button-hidden">Entrar</button>
            </div>
            <div className={`absolute top-0 h-full w-full flex flex-col items-center justify-center text-center p-10 transition-opacity duration-700 ease-in-out ${ isActive ? 'opacity-0 z-10' : 'opacity-100 z-20' }`}>
              <h1 className="font-bold text-3xl">Olá, Amigo(a)!</h1>
              <p className="text-sm my-4">Novo por aqui? Junte-se a nós clicando no botão abaixo.</p>
              <button onClick={handleRegisterClick} className="form-button-hidden">Registrar</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}