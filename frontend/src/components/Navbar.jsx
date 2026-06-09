import './Navbar.css'

function Navbar() {
    return (
        <div>
            <nav className="container-navbar">
                <div className="container-logo">
                    <img src="/images/car-favicon.svg" alt="Logo Danke Motorsport" className='logo-navbar' />

                    {/* <img src="public/images/dankelogo.jpeg" alt="Logo Danke Motorsport" className='logo-navbar' /> */}
                </div>
                <div className="container-secoes-navbar">
                    <a href="">
                        SERVIÇOS
                    </a>
                    <a href="">
                        SOBRE NÓS
                    </a>
                </div>
                <div className="container-auth">
                    <a href="/auth">
                        <button className='botao-auth-navbar'>
                            ENTRAR
                        </button>
                    </a>
                </div>
            </nav>
        </div>
    )
}

export default Navbar
