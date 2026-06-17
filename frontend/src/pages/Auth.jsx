import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IMaskInput } from 'react-imask'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import './Auth.css'
import { FaIdBadge, FaLock, FaPhoneAlt, FaRegEye, FaRegEyeSlash, FaUser } from "react-icons/fa";
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
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleMaskedChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const navigateByRole = (loggedUser) => {
        if (loggedUser.role === "Cliente") {
            navigate('/client-dashboard')
        } else if (loggedUser.role === "Funcionario") {
            navigate('/employee-dashboard')
        } else if (loggedUser.role === "Admin") {
            navigate('/admin-dashboard')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            if (isLogin) {
                const loggedUser = await login(formData.email, formData.senha)
                toast.success(`Bem-vindo, ${loggedUser.nome}!`)
                navigateByRole(loggedUser)
            } else {
                if (formData.senha !== formData.confirmarSenha) {
                    setError("As senhas não coincidem.")
                    setLoading(false)
                    return
                }

                await api.post('/danke/clientes', {
                    nome: formData.nome,
                    email: formData.email,
                    cpf: formData.cpf,
                    telefone: formData.telefone,
                    senha: formData.senha,
                    placaVeiculo: ""
                })

                const loggedUser = await login(formData.email, formData.senha)
                toast.success('Cadastro realizado com sucesso!')
                navigateByRole(loggedUser)
            }
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || err.response?.data?.Senha?.[0] || "Erro ao processar requisição. Verifique seus dados.")
        } finally {
            setLoading(false)
        }
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
                        <form className="container-login" onSubmit={handleSubmit}>
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
                            {error && <div className="auth-error" style={{ color: '#ff4d4d', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                            <div className="footer-auth">
                                <p className='texto-footer-auth'>
                                    Não tem uma conta?
                                    <a onClick={() => { setIsLogin(!isLogin) }}>
                                        Cadastre-se já
                                    </a>
                                </p>
                                <button type='submit' className="btn-auth" disabled={loading}>
                                    {loading ? "CARREGANDO..." : "ENTRAR"}
                                </button>
                            </div>
                        </form>
                        :
                        <form className="container-cadastro" onSubmit={handleSubmit}>
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
                                    <IMaskInput
                                        type='text'
                                        name='cpf'
                                        className='inpt-form'
                                        placeholder='000.000.000-00'
                                        mask='000.000.000-00'
                                        value={formData.cpf}
                                        onAccept={(value) => handleMaskedChange('cpf', value)}
                                        inputMode='numeric'
                                    />
                                </div>
                            </div>
                            <div className="grupo-inpt">
                                <label className='label-inpt'>
                                    Telefone
                                </label>
                                <div className="container-inpt-auth">
                                    <FaPhoneAlt className='icon-inpt' />
                                    <IMaskInput
                                        type='tel'
                                        name='telefone'
                                        className='inpt-form'
                                        placeholder='(00) 00000-0000'
                                        mask={[
                                            { mask: '(00) 0000-0000' },
                                            { mask: '(00) 00000-0000' },
                                        ]}
                                        value={formData.telefone}
                                        onAccept={(value) => handleMaskedChange('telefone', value)}
                                        inputMode='tel'
                                    />
                                </div>
                            </div>
                            {error && <div className="auth-error" style={{ color: '#ff4d4d', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                            <div className="footer-auth">
                                <p className='texto-footer-auth'>
                                    Já possui uma conta?
                                    <a onClick={() => { setIsLogin(!isLogin) }}>
                                        Entre por aqui
                                    </a>
                                </p>
                                <button type='submit' className="btn-auth" disabled={loading}>
                                    {loading ? "CARREGANDO..." : "CADASTRAR"}
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
