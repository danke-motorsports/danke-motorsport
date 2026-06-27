/**
 * @file AboutUs.jsx
 * @description Página "Sobre Nós" da Danke Motorsport.
 *
 * Apresenta a história, valores e canais de contato da oficina,
 * incluindo integração com Instagram e WhatsApp.
 */

import React from "react";
import Navbar from "../components/Navbar";
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaWrench, FaShieldAlt, FaClock } from "react-icons/fa";
import "./AboutUs.css";

function AboutUs() {
  return (
    <div className="sobre-page-wrapper">
      <Navbar />

      <div className="container-sobre">
        {/* Cabeçalho da Seção */}
        <header className="sobre-header">
          <span className="sobre-tagline">Nossa Essência</span>
          <h1>Sua paixão. Nossa precisão.</h1>
          <p className="sobre-lead">
            Conheça a história e o compromisso da Danke Motorsport com a excelência automotiva de alto padrão.
          </p>
        </header>

        {/* Grid de Conteúdo */}
        <div className="sobre-content-grid">
          
          {/* Lado Esquerdo: História e Destaques */}
          <div className="sobre-story-col">
            <div className="story-card">
              <h2>Quem Somos</h2>
              <p>
                A <strong>Danke Motorsport</strong> nasceu da paixão por engenharia de precisão e do desejo de oferecer
                um serviço de padrão internacional para veículos esportivos, importados e motocicletas premium na região
                de Palhoça e São José, SC.
              </p>
            </div>

            {/* Grid de Diferenciais */}
            <div className="diferenciais-grid">
              <div className="diferencial-card">
                <div className="diferencial-icon">
                  <FaWrench />
                </div>
                <h3>Precisão Técnica</h3>
                <p>Equipamentos de diagnóstico avançados e ferramentas específicas para marcas premium.</p>
              </div>

              <div className="diferencial-card">
                <div className="diferencial-icon">
                  <FaShieldAlt />
                </div>
                <h3>Transparência Total</h3>
                <p>Acompanhamento detalhado do serviço com clareza em cada etapa da manutenção.</p>
              </div>

              <div className="diferencial-card">
                <div className="diferencial-icon">
                  <FaClock />
                </div>
                <h3>Compromisso</h3>
                <p>Prazos respeitados e atenção minuciosa a cada detalhe do seu projeto.</p>
              </div>
            </div>

            {/* Card de Ação WhatsApp */}
            <div className="whatsapp-card">
              <div className="whatsapp-card-content">
                <h3>Fale Conosco Diretamente</h3>
                <p>Tem alguma dúvida ou deseja agendar um orçamento para o seu veículo?</p>
                <a
                  href="https://wa.me/5548988419992"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-direct"
                >
                  <FaWhatsapp className="icon-btn-wa" /> Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Lado Direito: Redes Sociais & Iframe */}
          <div className="sobre-media-col">
            <div className="media-card">
              <div className="media-card-header">
                <FaInstagram className="icon-insta-header" />
                <div>
                  <h3>Acompanhe no Instagram</h3>
                  <p>@dankemotorsport</p>
                </div>
              </div>
              
              <div className="instagram-embed-container">
                <iframe
                  src="https://www.instagram.com/p/DNqOA09N0_Q/embed/"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  scrolling="no"
                  allowFullScreen
                  title="Instagram Post Danke Motorsport"
                ></iframe>
              </div>

              <a
                href="https://www.instagram.com/dankemotorsport/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-instagram-profile"
              >
                Ver Perfil Completo
              </a>
            </div>

            <div className="location-info-card">
              <h3>
                <FaMapMarkerAlt className="icon-location" /> Onde Estamos
              </h3>
              <p>
                Estamos localizados na região de Palhoça/São José, SC, prontos para atender você.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AboutUs;
