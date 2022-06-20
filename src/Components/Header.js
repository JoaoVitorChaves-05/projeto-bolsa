import { Link } from "react-router-dom"
import { useState, useEffect } from 'react'
import '../Styles/Header.css'

const Header = ({isProfile}) => {
    const [isLogged, setIsLogged] = useState(false)
    const token = window.localStorage.getItem('token')

    useEffect(() => {
        if (!isLogged) {
            fetch('http://192.168.15.44:80/api/auth/token', { method: 'POST', body: JSON.stringify({token: token}), headers: {
                "Content-type": "application/json; charset=UTF-8"
            }})
            .then(response => response.json())
            .then(response => {
                if (response.authorized) setIsLogged(true)
            }).catch(() => console.log('Você não está logado!'))
        }
    }, [isLogged, token])

    if (!isProfile)
        return (
            <header className="header">
                <h1 className="title"><Link className="nav-title" to={`/`}>Título</Link></h1>
                {isLogged ? (
                    <nav className="navigation">
                        <Link className="nav-item" to={`/Profile`}>Perfil</Link>
                    </nav>
                ) : (
                    <nav className="navigation">
                        <Link className="nav-item" to={`/SignUp`}>Cadastrar</Link>
                        <Link className="nav-item" to={`/SignIn`}>Entrar</Link>
                    </nav>
                )}
            </header>
        )
    else 
        return (
            <header className="header">
                <h1 className="title"><Link className="nav-title" to={`/`}>Título</Link></h1>
                <nav className="navigation">
                    <Link className="nav-item" to={`/`}>Início</Link>
                </nav>
            </header>
        )
}

export default Header