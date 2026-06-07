/**
 * @file LandingPage.jsx
 * @description Página inicial pública da Danke Motorsport.
 *
 * Exibe a proposta de valor da oficina com headline, subtexto descritivo
 * e botões de CTA (Agendar Agora / Nossos Serviços).
 * Acessível por qualquer visitante — não requer autenticação.
 */

import Navbar from '../components/Navbar'
import './LandingPage.css'

/**
 * Componente da landing page.
 * Renderiza Navbar + conteúdo hero com chamada para ação.
 *
 * @returns {JSX.Element}
 */
function LandingPage() {
  return (
    <div>
      <Navbar />
      <div className="container-landing">
        <div className="conteudo-landing">
          <div className="texto-landing">
            <h1>Sua Paixão Merece a Nossa Precisão.</h1>
          </div>
          <div className="subtexto-landing">
            <p>
              A oficina mecânica especializada em veículos de alto padrão e motocicletas premium da região de Palhoça/São José, SC.
            </p>
          </div>
          <div className="btns-landing">
            <button className='btn-agendar'>
              AGENDAR AGORA
            </button>
            <button className="btn-servicos">
              NOSSOS SERVIÇOS
            </button>
          </div>
        </div>


      </div>
    </div>
  )
}

export default LandingPage
