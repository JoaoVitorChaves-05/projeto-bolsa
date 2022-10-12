import '../Styles/Home.css'
import '../Styles/Profile.css'
import '../Styles/Comment.css'

import { useEffect, useState } from 'react'
import Header from '../Components/Header.js'
import Footer from '../Components/Footer.js'

import React from 'react'
import LocationMarker from '../Components/LocationMarker.js'

import { AiFillDelete } from 'react-icons/ai'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
import Modal from '../Components/Modal'


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const Profile = () => {

    const handlePhoto = (event) => setPhotos([...photos, event.target.files[0]])
    
    const handleDelete = async (id) => {
        if (window.confirm('Você tem certeza que quer deletar essa foto?')) {
            const formData = new FormData()
            formData.append('id_photo', id)
            formData.append('token', token)
            
            const result = await fetch('http://localhost:5000/api/photo', {method: 'DELETE', body: formData})
            .then(response => response.json())
            .then(response => response)

            if (!result.success) {
                window.alert('Algo deu errado, tente novamente mais tarde.')
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

    const [id, setId] = useState(null)
    const [username, setUsername] = useState('')
    const [placename, setPlacename] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [initialPosition, setInitialPosition] = useState(null)
    const [position, setPosition] = useState(null)
    const [comments, setComments] = useState(null)
    const [modal, setModal] = useState({ isVisible: false, commentProps: null })


    const [submitType, setSubmitType] = useState('')

    const [photosURL, setPhotosURL] = useState([])
    
    const [photos, setPhotos] = useState([])
    const [inputElements, setInputElements] = useState([React.createElement('input', { 
        type: 'file',
        onChange: handlePhoto,
        name: 'photos',
        placeholder: 'Selecione o arquivo da foto'
    })])

    const [cityData, setCityData] = useState(null)

    const token = window.localStorage.getItem('token')

    useEffect(() => {

        if (!cityData) {
            fetch('http://localhost:5000/api/cities')
            .then((response) => response.json())
            .then((response) => setCityData(response))
        }

        if (!isLogged) {
            fetch('http://localhost:5000/api/auth/token', { method: 'POST', body: JSON.stringify({token: token}), headers: {
                "Content-type": "application/json; charset=UTF-8"
            }})
            .then(response => response.json())
            .then(response => {
                const {authorized, isUser} = response

                setIsUser(isUser)
                setIsLogged(authorized)
            }).catch(error => console.log(error))
        } else {
            console.log('você está logado')
            fetch(`http://localhost:5000/api/${isUser ? 'user' : 'place'}?token=` + token, { method: 'GET'})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if (isUser) {
                    const {username, email} = response
                    setUsername(username)
                    setEmail(email)
                } else {
                    const {id, placename, email, address, name, latitude, longitude} = response.place_details
                    
                    setPlacename(placename)
                    setEmail(email)
                    setPhotosURL(response.photos)
                    setAddress(address)
                    setCity(name)
                    setInitialPosition({latitude, longitude})
                    setId(id)

                    fetch(`http://localhost:5000/api/comment?id_place=${id}`)
                    .then(response => response.json())
                    .then(response => setComments(response))
                }
            })
        }

    }, [isLogged])

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

                    if (position) {
                        formData.append('latitude', position.lat)
                        formData.append('longitude', position.lng)
                    } else {
                        formData.append('latitude', initialPosition.latitude)
                        formData.append('longitude', initialPosition.longitude)
                    }

                    filteredPhotos.forEach(photo => formData.append('photos', photo))
                }

                fetch('http://localhost:5000/api/update/' + (isUser ? 'user' : 'place'), { method: 'POST', body: formData}).then(response => response.json())
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
                fetch('http://localhost:5000/api/' + (isUser ? 'user' : 'place'), { method: 'DELETE', body: JSON.stringify({token}), headers: { 
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
                            <select name='city' value={city} onChange={(e) => setCity(e.target.value)}>
                                <option value={null}>Selecione uma cidade</option>
                                {cityData ? cityData.map(city => <option key={city.id} value={city.name}>{city.name}</option>) : null}
                            </select>
                        </div>
                        <div className="form-field">
                            <input type="password" className="form-input" placeholder="Insira uma nova senha" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className='form-field'>
                            <h2>Mapa</h2>
                        </div>
                        <div className="form-field">
                            {initialPosition ? <MapContainer
                                center={[initialPosition.latitude, initialPosition.longitude]}
                                zoom={13}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                { position ? null : (
                                    <Marker position={[initialPosition.latitude, initialPosition.longitude]}>
                                        <Popup>Seu lugar fica aqui.</Popup>
                                    </Marker>
                                )}
                                <LocationMarker otherSetPosition={setPosition}/>
                            </MapContainer> : null}
                        </div>
                        <div className='form-field'>
                            <h2>Avaliações</h2>            
                        </div>
                        <div id='comments' className='form-field comments-area'>
                        {comments ? comments.map((comment) => (
                                <div key={comment.id} className="item-comment">
                                    <h3>{comment.username}</h3>
                                    <p>Publicado em <b>{(() => {
                                        // 2022-06-27T14:12:05.827Z
                                        let date = comment.timestamp.split('T')[0]
                                        
                                        let newDate = date.split('-')[2] + '/' + date.split('-')[1] + '/' + date.split('-')[0]
                                        
                                        return newDate
                                        })()}</b></p>
                                    <p>{comment.comment}</p>
                                    <p><b>Nota da entrada: </b>{comment.entrancegrade}/5</p>
                                    <p><b>Nota dos banheiros: </b>{comment.bathroomgrade}/5</p>
                                    <p><b>Nota do interior: </b>{comment.interiorgrade}/5</p>
                                    <p><b>Nota do estacionamento: </b>{comment.parkinggrade}/5</p>
                                    {comment.feedback ? (
                                    <div className='feedback-area'>
                                        <h3>Atendimento ao cliente</h3>
                                        <p>{comment.feedback}</p>
                                    </div>) : (
                                        <p onClick={() => setModal({ isVisible: true, commentProps: {
                                            comment_id: comment.id,
                                            comment: comment.comment,
                                            username: comment.username,
                                            entrancegrade: comment.entrancegrade,
                                            bathroomgrade: comment.bathroomgrade,
                                            interiorgrade: comment.interiorgrade,
                                            parkinggrade: comment.parkinggrade,
                                            timestamp: comment.timestamp
                                        }})} className="highlight-text">Responder comentário</p>
                                    )}
                                </div>
                            )): null}
                        </div>
                        <div className="form-field">
                            <h2>Minhas fotos</h2>
                        </div>
                        {photosURL.map((photo) => (
                            <div key={photo.id} className="form-field image-item">
                                <img src={'http://localhost:5000' + photo.photo_url} />
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
            <Modal isVisible={modal.isVisible} commentProps={modal.commentProps} controllState={setModal} />
        </div>
    )
}

export default Profile