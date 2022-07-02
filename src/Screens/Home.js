import '../Styles/Home.css'
import Header from '../Components/Header.js'
import Footer from '../Components/Footer.js'
import SearchBox from '../Components/SearchBox.js'

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
          <div className="main">
            <h2>Objetivo do projeto</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut
              nibh vitae justo pulvinar ultrices. Sed eu auctor erat, at posuere
              purus. Nullam est leo, tincidunt at mattis at, interdum eget
              lorem. Etiam efficitur tellus vel luctus ullamcorper. Quisque id
              ipsum nec ante vehicula sagittis. Aenean bibendum augue id
              sollicitudin dignissim. Vestibulum eget velit elementum, ultricies
              eros in, congue felis. Maecenas at ante at lacus scelerisque
              fringilla. Proin nec ligula id lacus ornare semper. Vestibulum
              iaculis lacus eu cursus pellentesque. Mauris quis mauris massa.
              Maecenas tincidunt mi eu nisi hendrerit condimentum at vitae orci.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
}

export default Home