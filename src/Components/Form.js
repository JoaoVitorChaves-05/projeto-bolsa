import '../Styles/Form.css'

import {useState, useEffect} from 'react'

const Form = ({signIn}) => {
    const handleType = (e) => e.target.className === 'active' ? null : setIsUser(!isUser)

    const handleSubmit = (event) => {
        event.preventDefault()
        if (isUser) {
            const controller = {
                signIn: () => {
                    if (email !== '' && password !== '') {
                        fetch(action, { method: 'POST', body: JSON.stringify({email, password}), headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }})
                        .then((response) => response.json())
                        .then((response) => {
                            console.log(response)
                            if (response.success) { 
                                window.localStorage.setItem('token', response.token)
                                window.location.href = '/'
                            }
                            else window.alert('Erro ao entrar, tente novamente!')
                        })
                    }
                },
                signUp: () => {
                    if (email !== '' && password !== '' && username !== '') {
                        console.log({email, password, username})
                        fetch(action, { method: 'POST', body: JSON.stringify({email, password, username}), headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }})
                        .then((response) => response.json())
                        .then((response) => {
                            console.log(response)
                            if (response.success) window.location.href = '/SignIn'
                            else window.alert('Teste')
                        })
                    } else window.alert('Preencha todos os campos')
                }
            }
            signIn ? controller.signIn() : controller.signUp()
        } else {
            const controller = {
                signIn: () => {
                    if (email !== '' && password !== '') {
                        fetch(action, { method: 'POST', body: JSON.stringify({email, password}), headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }})
                        .then((response) => response.json())
                        .then((response) => {
                            if (response.success) { 
                                window.localStorage.setItem('token', response.token)
                                window.location.href = '/'
                            }
                            else window.alert('Erro ao entrar, tente novamente!')
                        })
                    } else window.alert('Preencha todos os campos!')
                },
                signUp: () => {
                    if (email !== '' && password !== '' &&
                    placename !== '' && address !== '' &&
                    city !== '') {
                        fetch(action, { method: 'POST', body: JSON.stringify({email, password, placename, address, city}), headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }})
                        .then((response) => response.json())
                        .then((response) => {
                            if (response.success) {
                                window.localStorage.setItem('token', response.token)
                                window.location.href = '/Sign'
                            }
                            else window.alert('Erro ao cadastrar, tente novamente!')
                        })
                    } else window.alert('Preencha todos os campos!')
                }
            }
            signIn ? controller.signIn() : controller.signUp()
        }
    }

    const [isUser, setIsUser] = useState(true)
    const [action, setAction] = useState('http://192.168.15.44:8080/api/auth/user')
    const [username, setUsername] = useState('')
    const [placename, setPlacename] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [photos, setPhotos] = useState([])

    useEffect(() => {
        console.log(signIn)
        if (isUser) {
            if (signIn) {
                setAction('http://192.168.15.44:8080/api/auth/user')
            } else {
                setAction('http://192.168.15.44:8080/api/user')
            }
            setEmail('')
            setPassword('')
        } else {
            if (signIn) {
                setAction('http://192.168.15.44:8080/api/auth/place')
            } else {
                setAction('http://192.168.15.44:8080/api/place')
            }
            
            setEmail('')
            setPassword('')
        }
    }, [isUser, action, signIn])

    if (!signIn) {
        return (
            <form action={action} onSubmit={handleSubmit} method={'POST'}>
                <div className="form-field">
                    <h2>Quem você é?</h2>
                    {isUser ?
                        <div className="form-type-field form-field">
                            <button type="button" className="active" onClick={handleType}>Usuário</button>
                            <button type="button" onClick={handleType}>Lugar</button>
                        </div> : 
                        <div className="form-type-field form-field">
                            <button type="button" onClick={handleType}>Usuário</button>
                            <button type="button" className="active" onClick={handleType}>Lugar</button>
                        </div>
                    }
                </div>
                {isUser ? (
                    <div className="form-field">
                        <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" name="username" placeholder="Insira seu nome de usuário" />
                    </div>
                ) : 
                    <div className="form-field">
                        <input value={placename} onChange={(e) => setPlacename(e.target.value)} type="text" name="username" placeholder="Insira seu nome de usuário" />
                    </div>
                }
                <div className="form-field">
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" name="email" placeholder="Insira seu email" />
                </div>
                <div className="form-field">
                    <input value={password} onChange={(e) => setPassword(e.target.value)}  type="password" name="password" placeholder="Insira sua senha" />
                </div>
                {isUser ? null : (
                    <div className="form-field">
                        <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" name="address" placeholder="Insira o endereço" />
                    </div>
                )}
                {isUser ? null : (
                    <div className="form-field">
                        <input value={city} onChange={(e) => setCity(e.target.value)} type="text" name="city" placeholder="Insira a cidade" />
                    </div>
                )}
                <div className="form-field">
                    <button type="submit" className="form-btn">Cadastrar</button>
                </div>
            </form>
        )
    } else {
        return (
            <form action={action} onSubmit={handleSubmit} method={'POST'}>
                <h3>Entrar</h3>
                <div className="form-field">
                    <h2>Quem você é?</h2>
                        {isUser ?
                            <div className="form-type-field">
                                <button type="button" className="active" onClick={handleType}>Usuário</button>
                                <button type="button" onClick={handleType}>Lugar</button>
                            </div> : 
                            <div className="form-type-field">
                                <button type="button" onClick={handleType}>Usuário</button>
                                <button type="button" className="active" onClick={handleType}>Lugar</button>
                            </div>
                        }
                </div>
                <div className="form-field">
                    <input value={email} onChange={(e) => setEmail(e.target.value)}  type="text" placeholder="Email" id="username"/>
                </div>
                <div className="form-field">
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" id="password" />
                </div>
                <div className="form-field">
                    <button className="form-btn">Entrar</button>
                </div>
            </form>
        )
    }

}

export default Form