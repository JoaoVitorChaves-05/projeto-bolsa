import Header from '../Components/Header'
import SearchBox from '../Components/SearchBox'
import Card from '../Components/Card'
import Footer from '../Components/Footer'

import '../Styles/Search.css'

import {useState, useEffect, useMemo} from 'react'
import { useLocation } from 'react-router-dom'

const useQuery = () => {
    const {search} = useLocation()

    return useMemo(() => new URLSearchParams(search), [search])
}

const Search = () => {
    const [searchParams, setSearchParams] = useState(useQuery().get('city'));
    const [cards, setCards] = useState([])

    const fetchData = async (city) => {
        try {
            const data = await fetch('http://192.168.15.44:8080/api/places?city=' + city)
            .then((response) => response.json())
            .then((results) => setCards(results))
            return data
        }
        catch (error) {
            console.log(error)
            return []
        }
    }

    useEffect(() => {
        if (searchParams)
            fetchData(searchParams)
    }, [searchParams])

    return (
        <div className="screen">
            <Header />
            <main>
                <div className="search-area">
                    <SearchBox initialSearch={searchParams}/>
                </div>
                <div className="cards">
                    {cards ? cards.map((card, index) => (
                        <Card 
                            key={index}
                            id={card.id}
                            photos={card.photos}
                            placename={card.placename}
                            address={card.address}
                        />
                    )) : <h2>Nenhum local encontrado</h2>}
                </div>
            </main>
            <Footer />
        </div>
    )
}


export default Search