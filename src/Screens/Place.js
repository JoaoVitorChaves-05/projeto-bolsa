import {useState, useEffect, useMemo, useRef} from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../Components/Header.js'
import { AiFillMail } from "react-icons/ai";
import { FaMapMarkerAlt, FaRegStar } from "react-icons/fa";

import '../Styles/Place.css'
import '../Styles/Comment.css'
import Footer from '../Components/Footer.js'

const useQuery = () => {
    const {search} = useLocation()

    return useMemo(() => new URLSearchParams(search), [search])
}

const Place = () => {
    const [searchParams, setSearchParams] = useState(useQuery().get('id'));
    const data = useRef(null)
    
    const index = useRef(0)
    const [currentIndex, setCurrentIndex] = useState(0)

    const [isVisible, setIsVisible] = useState(false)
    const [comment, setComment] = useState('')
    const [grade, setGrade] = useState('')
    const [comments, setComments] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)

    const [entranceGrade, setEntranceGrade] = useState('')
    const [bathroomGrade, setBathroomGrade] = useState('')
    const [interiorGrade, setInteriorGrade] = useState('')
    const [parkingGrade, setParkingGrade] = useState('')

    const fetchData = async (id) => {
        try {
            let get = await fetch('http://localhost:5000/api/place?id=' + id)
            let json = await get.json()
            data.current = json
            setInterval(() => {
                if (index.current + 1 >= data.current.photos.length) index.current = 0
                else index.current += 1
                setCurrentIndex(index.current)
            }, 5000)
            setIsLoaded(true)
        }
        catch (error) {
            console.log(error)
            return null
        }
    }

    const fetchComments = async (id) => {
        try {
            const data = await fetch('http://localhost:5000/api/comment?id_place=' + id)
            .then((response) => response.json())
            .then((results) => {
                setComments(results)
                console.log(results)
            })
            return data
        } catch {
            window.alert('Erro ao buscar os comentários')
            return null
        }
    }

    const handleChangeGrade = (typeGrade, value) => {
        const grades = {
            'entranceGrade': setEntranceGrade,
            'bathroomGrade': setBathroomGrade,
            'interiorGrade': setInteriorGrade,
            'parkingGrade': setParkingGrade
        }

        grades[typeGrade](value)
    }
    const handleChangeComment = (e) => setComment(e.target.value)
    const handleWriteComment = () => setIsVisible(!isVisible)
    const handleSubmitComment = async () => {
        const token = (() => {
            try {
                return JSON.parse(window.localStorage.getItem('token'))
            } catch {
                return window.localStorage.getItem('token')
            }
        })()
        const timestamp = new Date()

        if (
            (entranceGrade <= 0 || entranceGrade >= 6) &&
            (bathroomGrade <= 0 || bathroomGrade >= 6) &&
            (interiorGrade <= 0 || interiorGrade >= 6) &&
            (parkingGrade <= 0 || parkingGrade >= 6)
        ) {
            return window.alert('Insira uma nota válida!')
        }

        if (token) {
            const formData = new FormData()

            formData.append('token', token)
            formData.append('comment', comment)
            formData.append('entranceGrade', entranceGrade)
            formData.append('bathroomGrade', bathroomGrade)
            formData.append('interiorGrade', interiorGrade)
            formData.append('parkingGrade', parkingGrade)
            formData.append('timestamp', timestamp.toJSON())
            formData.append('id_place', searchParams)   
            await fetch('http://localhost:5000/api/comment', { method: 'POST', body: formData})
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    setComment('')
                    setEntranceGrade('')
                    setBathroomGrade('')
                    setInteriorGrade('')
                    setParkingGrade('')
                    setIsVisible(false)
                    fetchComments(searchParams)
                    window.alert('Comentário postado!')
                } else if (!result.isUser) {
                    window.alert('Você é local, não pode avaliar outros!')
                } else {
                    window.alert('Erro ao comentar, tente novamente mais tarde!')
                }
            })
        }
        else window.alert('Você precisa estar logado para comentar!')
    }

    useEffect(() => {
        if (!searchParams) window.alert('Please provide a search')
        else {
            if (!data.current) {
                fetchData(searchParams)
            }

            if (!comments) fetchComments(searchParams)
        }
    }, [searchParams, comments])

    if (isLoaded) {

        return (
            <div className="screen">
                <Header />
                <main className="container">
                    <div className="data-area item-container">
                        <img src={"http://localhost:5000" + data.current.photos[currentIndex].photo_url} />
                        <h2>{data.current.place_details.placename}</h2>
                        <div className="item-data">
                            <AiFillMail size={"32px"}/>
                            <div className="info">
                                <p>{data.current.place_details.email}</p>
                            </div>
                        </div>
                        <div className="item-data">
                            <FaMapMarkerAlt size={"32px"} />
                            <div className="info">
                                <p>{data.current.place_details.address}</p>
                                <p>{data.current.place_details.city}</p>
                            </div>
                        </div>
                        <h2>Comentários</h2>
                        {isVisible ? <button onClick={handleWriteComment}>Cancelar comentário</button> : <button onClick={handleWriteComment}>Escrever comentário</button>}
                        {isVisible ? (
                            <div className="comment-box">
                                <textarea value={comment} onChange={handleChangeComment} type="text" className="comment-input" placeholder="Insira seu comentário, mas não esqueça de fazer uma crítica construtiva!" />
                                <label>Entrada</label>
                                <input value={entranceGrade} onChange={(e) => handleChangeGrade('entranceGrade', e.target.value)} type='number' min={1} max={5} placeholder="Dê uma nota de 1 à 5"/>
                                <label>Banheiros</label>
                                <input value={bathroomGrade} onChange={(e) => handleChangeGrade('bathroomGrade', e.target.value)} type='number' min={1} max={5} placeholder="Dê uma nota de 1 à 5"/>
                                <label>Interior</label>
                                <input value={interiorGrade} onChange={(e) => handleChangeGrade('interiorGrade', e.target.value)} type='number' min={1} max={5} placeholder="Dê uma nota de 1 à 5"/>
                                <label>Estacionamento</label>
                                <input value={parkingGrade} onChange={(e) => handleChangeGrade('parkingGrade', e.target.value)} type='number' min={1} max={5} placeholder="Dê uma nota de 1 à 5"/>
                                <button onClick={handleSubmitComment}>Comentar</button>
                            </div>
                        ) : null}
                    </div>
                    <div className="comments-area item-container">
                        
                        <div className="comments-container">
                            {comments ? comments.map((comment, index) => (
                                <div key={index} className="item-comment">
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
                                    </div>) : null}
                                </div>
                            )): null}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }
    
}

export default Place