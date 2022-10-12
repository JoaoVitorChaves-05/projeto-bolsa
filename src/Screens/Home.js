import '../Styles/Home.css'
import Header from '../Components/Header.js'
import Footer from '../Components/Footer.js'
import SearchBox from '../Components/SearchBox.js'
import Map from '../Components/Map.js'

const Home = () => {
    return (
      <div className="screen">
        <Header />
        <main>
          <div className="main">
            <h2>Não sabe onde ir?</h2>
            <p>
              Pesquise os melhores lugares para ir, e o melhor de tudo: sem
              susto! Aqui você fotos e comentários para ter a certeza de que o
              local é acessível, assim pode ir para qualquer lugar sem ter
              constrangimento!
            </p>
          </div>
          <div className="main search-area">
            <h2>Pesquise por lugares na sua cidade</h2>
            <SearchBox />
          </div>
          <div className='main'>
            <Map />
          </div>
          <div className="main">
            <h2>Objetivo do projeto</h2>
            <p>
            De acordo com o Censo demográfico de 2010, cerca de 46 milhões de pessoas declaram
            ter algum tipo de deficiência no Brasil. Mesmo com esse número expressivo, as condições
            de acessibilidades oferecidas ao portador de deficiência são incipientes e precárias. 
            Quando o foco são os cadeirantes, essa significativa parcela da população se encontra impedida 
            de exercer plenamente sua cidadania, uma vez que encontra sérias dificuldades para se locomover 
            em estabelecimentos e espaço urbano devido a barreiras arquitetônicas. 
            Diante dessa realidade da acessibilidade no Brasil, foi desenvolvida esta plataforma web focada em facilitar 
            a identificação de locais com melhor acesso a pessoas cadeirantes e com mobilidade reduzida.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
}

export default Home