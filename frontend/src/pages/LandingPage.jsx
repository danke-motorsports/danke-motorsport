import Navbar from '../components/Navbar'
import './LandingPage.css'

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
