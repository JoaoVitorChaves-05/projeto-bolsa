import '../Styles/Home.css'
import '../Styles/Profile.css'
import { useEffect, useState } from 'react'
import Header from '../Components/Header.js'
import Footer from '../Components/Footer.js'

const Profile = () => {
    const [isLogged, setIsLogged] = useState(false)
    const [isUser, setIsUser] = useState(false)

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [submitType, setSubmitType] = useState('')

    const token = window.localStorage.getItem('token')

    useEffect(() => {
        if (!isLogged) {
            fetch('http://192.168.15.44:8080/api/auth/token', { method: 'POST', body: JSON.stringify({token: token}), headers: {
                "Content-type": "application/json; charset=UTF-8"
            }})
            .then(response => response.json())
            .then(response => {
                setIsLogged(response.authorized)
                setIsUser(response.isUser)
                //if (!isLogged) window.location.href = '/Sign'
            }).catch(error => console.log(error))
        } else {
            fetch('http://192.168.15.44:8080/api/user?token=' + token, { method: 'GET'})
            .then(response => response.json())
            .then(response => {
                setUsername(response.username)
                setEmail(response.email)
            })
        }
    }, [isLogged, isUser, token])

    const handleSubmit = (event) => {
        event.preventDefault()
        const controller = {
            updateData: () => {
                fetch('http://192.168.15.44:8080/api/' + (isUser ? 'user' : 'place'), { method: 'PUT', body: JSON.stringify({
                    token,
                    dataToUpdate: {
                        username,
                        email,
                        password
                    }
                }), headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }}).then(response => response.json())
                .then(response => {
                    console.log(response)
                    response.status ? window.confirm('Dados atualizados com sucesso!') : window.alert('Erro ao atualizar dados!')
                })
                .catch(error => console.log(error))
            },
            signOut: () => {
                window.localStorage.setItem('token', null)
                window.location.href = '/'
            },
            excludeData: () => {
                console.log(JSON.stringify({token}))
                fetch('http://192.168.15.44:8080/api/' + (isUser ? 'user' : 'place'), { method: 'DELETE', body: JSON.stringify({token}), headers: { 
                    "Content-type": "application/json; charset=UTF-8"
                }}).then(response => response.json())
                .then(response => {
                    if (response.status)
                        if (window.confirm('Conta excluída!')) window.location.href = '/'
                    else window.alert('Erro ao excluir conta!')
                }).catch(error => console.log(error))
            }
        }
        console.log(submitType)
        controller[submitType]()
    }

    return (
        <div className="screen">
            <Header isProfile={true} />
            <main>
                {isUser ? (
                    <form className="form-profile" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <h2>Meus dados</h2>
                        </div>
                        <div className="form-field">
                            <input type="text" className="form-input" placeholder="Nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                        <div className="form-field">
                            <input type="email" className="form-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="form-field">
                            <input type="password" className="form-input" placeholder="Insira uma nova senha" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className="form-field">
                            <button onClick={(e) => setSubmitType(e.target.name)} name="updateData" type="submit" className='button save-button'>Salvar alterações</button>
                            <button onClick={(e) => setSubmitType(e.target.name)} name="signOut" type="submit" className='button exit-button'>Sair da conta</button>
                            <button onClick={(e) => setSubmitType(e.target.name)} name="excludeData" type="submit" className='button exclude-button'>Excluir conta</button>
                        </div>
                    </form>
                ) : (
                    <form>
                        <div className="form-field">
                            <h2>Meus dados</h2>
                        </div>
                        <div className="form-field">
                            <input type="text" className="form-input" placeholder="Nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                    </form>
                )}
            </main>
            <Footer />
        </div>
    )
}

export default Profile