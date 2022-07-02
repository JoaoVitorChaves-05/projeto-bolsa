import '../Styles/SearchBox.css'
import {useState} from 'react'


const SearchBox = ({initialSearch}) => {
    const [search, setSearch] = useState(initialSearch ? initialSearch : '')

    const onSubmit = () => {
        if (search.trim() !== '') return true
        return false
    }

    return (
        <form action='/Search' onSubmit={onSubmit}>
            <div className="form-field">
                <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" name="city" placeholder="Cidade" />
                <button type="submit">Buscar</button>
            </div>
        </form>
    )
}

export default SearchBox