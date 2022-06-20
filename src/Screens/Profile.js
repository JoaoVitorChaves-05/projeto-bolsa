import '../Styles/Home.css'
import '../Styles/Profile.css'
import { useEffect, useState } from 'react'
import Header from '../Components/Header.js'
import Footer from '../Components/Footer.js'

import React from 'react'

const Profile = () => {
    const handlePhoto = (event) => setPhotos([...photos, event.target.files[0]])
    
    const addPhoto = () => setInputElements([...inputElements, React.createElement('input', { 
        type: 'file',
        onChange: handlePhoto,
        name: 'photos',
        placeholder: 'Selecione o arquivo da foto'
    })])

    const [isLogged, setIsLogged] = useState(false)
    const [isUser, setIsUser] = useState(false)

    const [username, setUsername] = useState('')
    const [placename, setPlacename] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [submitType, setSubmitType] = useState('')

    const [photosURL, setPhotosURL] = useState([])
    
    const [photos, setPhotos] = useState([])
    const [inputElements, setInputElements] = useState([React.createElement('input', { 
        type: 'file',
        onChange: handlePhoto,
        name: 'photos',
        placeholder: 'Selecione o arquivo da foto'
    })])

    const token = window.localStorage.getItem('token')

    useEffect(() => {
        if (!isLogged) {
            fetch('http://192.168.15.44:80/api/auth/token', { method: 'POST', body: JSON.stringify({token: token}), headers: {
                "Content-type": "application/json; charset=UTF-8"
            }})
            .then(response => response.json())
            .then(response => {
                const {authorized, isUser} = response

                setIsLogged(authorized)
                setIsUser(isUser)
            }).catch(error => console.log(error))
        } else {
            console.log('você está logado')
            fetch(`http://192.168.15.44:80/api/${isUser ? 'user' : 'place'}?token=` + token, { method: 'GET'})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if (isUser) {
                    const {username, email} = response
                    setUsername(username)
                    setEmail(email)
                } else {
                    const {placename, email} = response.place_details
                    setPlacename(placename)
                    setEmail(email)
                    setPhotosURL(response.photos)
                }
            })
        }
    }, [isLogged, isUser, token])

    const handleSubmit = (event) => {
        event.preventDefault()
        const controller = {
            updateData: () => {
                const data = isUser ? {
                    token,
                    dataToUpdate: {
                        username,
                        email,
                        password
                    }
                } : {
                    token,
                    dataToUpdate: {
                        placename,
                        email,
                        password,
                    }
                }

                const filteredPhotos = inputElements.filter(el => el.value ? true : false)

                fetch('http://192.168.15.44:80/api/' + (isUser ? 'user' : 'place'), { method: 'PUT', body: JSON.stringify({...data, files: isUser ? null : filteredPhotos}), headers: {"Content-type": "application/json; charset=UTF-8"}}).then(response => response.json())
                .then(response => {
                    console.log(response)
                    response.success ? window.confirm('Dados atualizados com sucesso!') : window.alert('Erro ao atualizar dados!')
                })
                .catch(error => console.log(error))
            },
            signOut: () => {
                window.localStorage.setItem('token', null)
                window.location.href = '/'
            },
            excludeData: () => {
                fetch('http://192.168.15.44:80/api/' + (isUser ? 'user' : 'place'), { method: 'DELETE', body: JSON.stringify({token}), headers: { 
                    "Content-type": "application/json; charset=UTF-8"
                }}).then(response => response.json())
                .then(response => {
                    if (response.success)
                        if (window.confirm('Conta excluída!')) window.location.href = '/'
                    else window.alert('Erro ao excluir conta!')
                }).catch(error => console.log(error))
            }
        }
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
                    <form className="form-profile" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <h2>Meus dados</h2>
                        </div>
                        <div className="form-field">
                            <input type="text" className="form-input" placeholder="Nome do local" value={placename} onChange={(e) => setPlacename(e.target.value)}/>
                        </div>
                        <div className="form-field">
                            <input type="email" className="form-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="form-field">
                            <input type="password" className="form-input" placeholder="Insira uma nova senha" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className="form-field">
                            <h2>Minhas fotos</h2>
                        </div>
                        {photosURL.map((photo) => (
                            <div className="form-field">
                                <img src={'http://localhost:80' + photo.photo_url} />
                            </div>
                        ))}
                        <div className="form-field form-field-input">
                            {inputElements.map((element) => element)}
                        </div>
                        <div className="form-field">
                            <button onClick={addPhoto} type="button" className="button add-photo">Adicionar foto</button>
                        </div>
                        <div className="form-field">
                            
                            <button onClick={(e) => setSubmitType(e.target.name)} name="updateData" type="submit" className='button save-button'>Salvar alterações</button>
                            <button onClick={(e) => setSubmitType(e.target.name)} name="signOut" type="submit" className='button exit-button'>Sair da conta</button>
                            <button onClick={(e) => setSubmitType(e.target.name)} name="excludeData" type="submit" className='button exclude-button'>Excluir conta</button>
                        </div>
                    </form>
                )}
            </main>
            <Footer />
        </div>
    )
}

export default Profile