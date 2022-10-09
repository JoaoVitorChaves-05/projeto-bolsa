import '../Styles/Form.css'
import '../Styles/Map.css'

import {useState, useEffect} from 'react'

import React from 'react'
import LocationMarker from './LocationMarker'

import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function SetCenter({center}) {
    const map = useMap()
    map.setView(center)
    return null
}


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
                            else window.alert(response.message)
                        })
                    }
                },
                signUp: () => {
                    if (email !== '' && password !== '' && username !== '') {
                        fetch(action, { method: 'POST', body: JSON.stringify({email, password, username}), headers: { "Content-Type": "application/json; charset=UTF-8"}})
                        .then((response) => response.json())
                        .then((response) => {
                            console.log(response)
                            if (response.success) window.location.href = '/SignIn'
                            else window.alert('Erro ao cadastrar!')
                        })
                    } else window.alert('Preencha todos os campos')
                }
            }
            signIn ? controller.signIn() : controller.signUp()
        } else {
            const controller = {
                signIn: () => {
                    if (email !== '' && password !== '') {
                        const formData = new FormData()
                        formData.append('email', email)
                        formData.append('password', password)
                        fetch(action, { method: 'POST', body: formData})
                        .then((response) => response.json())
                        .then((response) => {
                            console.log(response)
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
                    city !== null && photos.length && position !== null) {
                        const filteredPhotos = photos.filter(photos => photos ? true : false)
                        const formData = new FormData()
                        const currentCity = cityData.filter(city => city.name === city.name ? true : false)


                        formData.append('placename', placename)
                        formData.append('email', email)
                        formData.append('password', password)
                        formData.append('address', address)
                        formData.append('id_city', currentCity[0].id)
                        formData.append('latitude', position.lat)
                        formData.append('longitude', position.lng)

                        filteredPhotos.forEach(photo => {
                            formData.append('photos', photo, photo.name)
                        })

                        fetch(action, { method: 'POST', body: formData})
                        .then((response) => response.json())
                        .then((response) => {
                            if (response.success) {
                                window.localStorage.setItem('token', response.token)
                                window.location.href = '/SignIn'
                            }
                            else window.alert('Erro ao cadastrar, tente novamente!')
                        })
                    } else window.alert('Preencha todos os campos!')
                }
            }
            signIn ? controller.signIn() : controller.signUp()
        }
    }

    const handlePhoto = (event) => setPhotos([...photos, event.target.files[0]])

    const addPhoto = () => setInputElements([...inputElements, React.createElement('input', { 
        type: 'file',
        onChange: handlePhoto,
        name: 'photos',
        placeholder: 'Selecione o arquivo da foto'
    })])

    const [isUser, setIsUser] = useState(true)
    const [action, setAction] = useState('http://localhost:80/api/auth/user')
    const [username, setUsername] = useState('')
    const [placename, setPlacename] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [photos, setPhotos] = useState([])
    const [inputElements, setInputElements] = useState([React.createElement('input', { 
        type: 'file',
        onChange: handlePhoto,
        name: 'photos',
        placeholder: 'Selecione o arquivo da foto'
    })])
    const [mapIsVisible, setMapIsVisible] = useState(false)
    const [center, setCenter] = useState(null)
    const [position, setPosition] = useState(null)
    const [cityData, setCityData] = useState(null)

    useEffect(() => {
        if (isUser) {
            if (signIn) {
                setAction('http://localhost:80/api/auth/user')
            } else {
                setAction('http://localhost:80/api/user')
            }
        } else {
            if (signIn) {
                setAction('http://localhost:80/api/auth/place')
            } else {
                setAction('http://localhost:80/api/place')
            }
        }

        if (!cityData) {
            fetch('http://localhost:80/api/cities')
            .then(response => response.json())
            .then(response => setCityData(response))
        }

        if (city) {
            const currentCity = cityData.filter(obj => obj.name === city ? true : false)
            console.log(currentCity)
            setCenter([currentCity[0].latitude, currentCity[0].longitude])
            setMapIsVisible(true)
        }
        else setMapIsVisible(false)

        console.log(cityData)
    }, [isUser, action, signIn, photos, city, position, cityData])

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
                        <input value={username} onChange={(e) => {setUsername(e.target.value); console.log(e.target.value)}} type="text" name="username" placeholder="Insira seu nome de usuário" />
                    </div>
                ) : 
                    <div className="form-field">
                        <input value={placename} onChange={(e) => setPlacename(e.target.value)} type="text" name="placename" placeholder="Insira seu nome de usuário" />
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
                        <select name='city' value={city} onChange={(e) => setCity(e.target.value)}>
                            <option value={null}>Selecione uma cidade</option>
                            {cityData ? cityData.map(city => (
                                <option key={city.id} value={city.name}>{city.name}</option>
                            )) : null}
                        </select>
                    </div>
                )}
                {mapIsVisible && isUser === false ? (
                    <MapContainer
                        center={[50.5, 30.5]}
                        zoom={13} 
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker otherSetPosition={setPosition}/>
                        <SetCenter center={center}/>
                    </MapContainer>
                ) : null}
                {isUser ? null : (
                    <div className="form-field form-field-input">
                        {inputElements.map((element) => element)}
                    </div>
                )}
                {isUser ? null : (
                    <div className="form-field">
                        <button onClick={addPhoto} type="button" className="form-btn">Adicionar foto</button>
                    </div>
                )}
                <div className="form-field">
                    <button type="submit" className="form-btn" id="confirm">Cadastrar</button>
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
                    <input name="email" value={email} onChange={(e) => setEmail(e.target.value)}  type="text" placeholder="Email" id="username"/>
                </div>
                <div className="form-field">
                    <input name="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" id="password" />
                </div>
                <div className="form-field">
                    <button className="form-btn">Entrar</button>
                </div>
            </form>
        )
    }

}

export default Form