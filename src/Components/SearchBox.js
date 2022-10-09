import '../Styles/SearchBox.css'
import {useState, useEffect} from 'react'


const SearchBox = ({initialSearch}) => {
    const [search, setSearch] = useState(initialSearch ? initialSearch : '')
    const [cityData, setCityData] = useState(null)

    const onSubmit = () => {
        if (search.trim() !== '') return true
        return false
    }

    useEffect(() => {
        if (!cityData) {
            fetch('http://localhost:80/api/cities')
            .then((response) => response.json())
            .then((response) => setCityData(response))
        }
    })

    return (
        <form action='/Search' onSubmit={onSubmit}>
            <div className="form-field">
                <select name='city' value={search} onChange={(e) => setSearch(e.target.value)}>
                    <option value={null}>Selecione uma cidade</option>
                    {cityData ? cityData.map(city => <option key={city.id} value={city.name}>{city.name}</option>) : null}
                </select>
                <button type="submit">Buscar</button>
            </div>
        </form>
    )
}

export default SearchBox