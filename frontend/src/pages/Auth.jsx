import { useState } from 'react'
import './Auth.css'
import { FaEye, FaIdBadge, FaLock, FaPhoneAlt, FaRegEye, FaRegEyeSlash, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        cpf: "",
        telefone: "",
        senha: "",
        confirmarSenha: "",
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    return (
        <div>
            <div className="container-auth">
                <div className="container-form">
                    <div className="header-auth">
                        {/* <img src="/images/dankelogo.jpeg" alt="Logo da Oficina" className='logo-auth' /> */}
                        <p className="subtitulo-auth">
                            {isLogin ? "Bem vindo de volta!" : "Crie sua conta"}
                            {/* <button onClick={() => { setIsLogin(!isLogin) }}>trocar auth</button> */}
                        </p>
                    </div>
                    {isLogin ?
                        <form className="container-login">
                            <div className="grupo-inpt">
                                <label className='label-inpt'>
                                    Email
                                </label>
                                <div className="container-inpt-auth">
                                    <MdEmail className='icon-inpt' />
                                    <input
                                        type='text'
                                        name='email'
                                        className='inpt-form'
                                        placeholder='Email'
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grupo-inpt">
                                <label className='label-inpt'>
                                    Senha
                                </label>
                                <div className="container-inpt-auth">
                                    <FaLock className='icon-inpt' />
                                    <input
                                        type={mostrarSenha ? 'text' : 'password'}
                                        name='senha'
                                        className='inpt-form'
                                        placeholder='Senha'
                                        value={formData.senha}
                                        onChange={handleChange}
                                    />
                                    {mostrarSenha ?
                                        <FaRegEye
                                            className="btn-mostrar-senha"
                                            onClick={() => { setMostrarSenha(!mostrarSenha) }}
                                        />
                                        :
                                        <FaRegEyeSlash
                                            className="btn-mostrar-senha"
                                            onClick={() => { setMostrarSenha(!mostrarSenha) }}
                                        />
                                    }
                                </div>
                            </div>
                            <div className="footer-auth">
                                <p className='texto-footer-auth'>
                                    Não tem uma conta?
                                    <a onClick={() => { setIsLogin(!isLogin) }}>
                                        Cadastre-se já
                                    </a>
                                </p>
                                <button type='submit' className="btn-auth">
                                    ENTRAR
                                </button>
                            </div>
                        </form>
                        :
                        <form className="container-cadastro">
                            <div className="grupo-inpt">
                                <label className='label-inpt'>
                                    Nome
                                </label>
                                <div className="container-inpt-auth">
                                    <FaUser className='icon-inpt' />
                                    <input
                                        type='text'
                                        name='nome'
                                        className='inpt-form'
                                        placeholder='Nome'
                                        value={formData.nome}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grupo-inpt">
                                <label className='label-inpt'>
                                    Senha
                                </label>
                                <div className="container-inpt-auth">
                                    <FaLock className='icon-inpt' />
                                    <input
                                        type={mostrarSenha ? 'text' : 'password'}
                                        name='senha'
                                        className='inpt-form'
                                        placeholder='Senha'
                                        value={formData.senha}
                                        onChange={handleChange}
                                    />
                                    {mostrarSenha ?
                                        <FaRegEye
                                            className="btn-mostrar-senha"
                                            onClick={() => { setMostrarSenha(!mostrarSenha) }}
                                        />
                                        :
                                        <FaRegEyeSlash
                                            className="btn-mostrar-senha"
                                            onClick={() => { setMostrarSenha(!mostrarSenha) }}
                                        />
                                    }
                                </div>
                            </div>
                            <div className="grupo-inpt">
                                <label className='label-inpt'>
                                    Confirmar Senha
                                </label>
                                <div className="container-inpt-auth">
                                    <FaLock className='icon-inpt' />
                                    <input
                                        type={mostrarSenha ? 'text' : 'password'}
                                        name='confirmarSenha'
                                        className='inpt-form'
                                        placeholder='Confirmar Senha'
                                        value={formData.confirmarSenha}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grupo-inpt">
                                <label className='label-inpt'>
                                    Email
                                </label>
                                <div className="container-inpt-auth">
                                    <MdEmail className='icon-inpt' />
                                    <input
                                        type='text'
                                        name='email'
                                        className='inpt-form'
                                        placeholder='seu@email.com'
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grupo-inpt">
                                <label className='label-inpt'>
                                    CPF
                                </label>
                                <div className="container-inpt-auth">
                                    <FaIdBadge className='icon-inpt' />
                                    <input
                                        type='text'
                                        name='cpf'
                                        className='inpt-form'
                                        placeholder='XXX.XXX.XXX-XX'
                                        value={formData.cpf}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grupo-inpt">
                                <label className='label-inpt'>
                                    Telefone
                                </label>
                                <div className="container-inpt-auth">
                                    <FaPhoneAlt className='icon-inpt' />
                                    <input
                                        type='tel'
                                        name='telefone'
                                        className='inpt-form'
                                        placeholder='(XX) XXXXX-XXXX'
                                        value={formData.telefone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="footer-auth">
                                <p className='texto-footer-auth'>
                                    Já possui uma conta?
                                    <a onClick={() => { setIsLogin(!isLogin) }}>
                                        Entre por aqui
                                    </a>
                                </p>
                                <button type='submit' className="btn-auth">
                                    CADASTRAR
                                </button>
                            </div>
                        </form>
                    }
                </div>
            </div>
        </div>
    )
}

export default Auth
