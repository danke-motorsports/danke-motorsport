/**
 * @file LandingPage.jsx
 * @description Página inicial pública da Danke Motorsport.
 *
 * Exibe a proposta de valor da oficina com headline, subtexto descritivo
 * e botões de CTA (Agendar Agora / Nossos Serviços).
 * Acessível por qualquer visitante — não requer autenticação.
 */

import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import "./LandingPage.css";

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
              A oficina mecânica especializada em veículos de alto padrão e
              motocicletas premium da região de Palhoça/São José, SC.
            </p>
          </div>
          <div className="btns-landing">
            <Link to="/auth">
              <button className="btn-agendar">AGENDAR AGORA</button>
            </Link>
            <a href="https://instagram.com/dankemotorsport" target="_blank">
              <button className="btn-servicos">NOSSAS REDES</button>
            </a>
          </div>
        </div>

        <div className="landing-map-section">
          <iframe
            className="landing-map-iframe"
            title="Localização Danke Motorsport"
            src="https://maps.google.com/maps?q=Danke+Motorsport,-27.6116937,-48.6540768&hl=pt-BR&z=17&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
