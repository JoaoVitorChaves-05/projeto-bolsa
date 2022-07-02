import '../Styles/Home.css'
import '../Styles/Profile.css'
import { useEffect, useState } from 'react'
import Header from '../Components/Header.js'
import Footer from '../Components/Footer.js'

import React from 'react'

import { AiFillDelete } from 'react-icons/ai'

const Profile = () => {
    const handlePhoto = (event) => setPhotos([...photos, event.target.files[0]])
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this photo?')) {
            const formData = new FormData()
            formData.append('id_photo', id)
            formData.append('token', token)
            
            const result = await fetch('http://localhost:80/api/photo', {method: 'DELETE', body: formData})
            .then(response => response.json())
            .then(response => response)

            if (!result.success) {
                window.alert('Something went wrong with deleting')
            } else {
                window.location.reload()
            }
        }
    }

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
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')

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
            fetch('http://localhost:80/api/auth/token', { method: 'POST', body: JSON.stringify({token: token}), headers: {
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
            fetch(`http://localhost:80/api/${isUser ? 'user' : 'place'}?token=` + token, { method: 'GET'})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if (isUser) {
                    const {username, email} = response
                    setUsername(username)
                    setEmail(email)
                } else {
                    const {placename, email, address, city} = response.place_details
                    setPlacename(placename)
                    setEmail(email)
                    setPhotosURL(response.photos)
                    setAddress(address)
                    setCity(city)
                }
            })
        }
    }, [isLogged, isUser, token])

    const handleSubmit = (event) => {
        event.preventDefault()
        const controller = {
            updateData: () => {
                const filteredPhotos = photos.filter(el => el ? true : false)
                const formData = new FormData()
                
                if (isUser) {
                    formData.append('token', token)
                    formData.append('username', username)
                    formData.append('password', password)
                    formData.append('email', email)
                } else {
                    formData.append('token', token)
                    formData.append('placename', placename)
                    formData.append('password', password)
                    formData.append('email', email)
                    formData.append('address', address)
                    formData.append('city', city)

                    filteredPhotos.forEach(photo => formData.append('photos', photo))
                }

                fetch('http://localhost:80/api/update/' + (isUser ? 'user' : 'place'), { method: 'POST', body: formData}).then(response => response.json())
                .then(response => {
                    console.log(response)
                    response.success ? window.location.reload() : window.alert('Erro ao atualizar dados!')
                })
                .catch(error => console.log(error))
            },
            signOut: () => {
                window.localStorage.setItem('token', null)
                window.location.href = '/'
            },
            excludeData: () => {
                fetch('http://localhost:80/api/' + (isUser ? 'user' : 'place'), { method: 'DELETE', body: JSON.stringify({token}), headers: { 
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
                    <form className="form-profile" onSubmit={handleSubmit} method={'POST'}>
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
                        <div className='form-field'>
                            <input type="text" className="form-input" placeholder='Endereço' value={address} onChange={(e) => setAddress(e.target.value)}/>
                        </div>
                        <div className='form-field'>
                            <input type="text" className="form-input" placeholder='Cidade' value={city} onChange={(e) => setCity(e.target.value)}/>
                        </div>
                        <div className="form-field">
                            <input type="password" className="form-input" placeholder="Insira uma nova senha" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className="form-field">
                            <h2>Minhas fotos</h2>
                        </div>
                        {photosURL.map((photo) => (
                            <div key={photo.id} className="form-field image-item">
                                <img src={'http://localhost:80' + photo.photo_url} />
                                <AiFillDelete onClick={() => handleDelete(photo.id)} size="48px" className='image-icon'/>
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