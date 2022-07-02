import {useState, useEffect, useMemo} from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../Components/Header.js'
import { AiFillMail } from "react-icons/ai";
import { FaMapMarkerAlt, FaRegStar } from "react-icons/fa";

import '../Styles/Place.css'
import Footer from '../Components/Footer.js'

const useQuery = () => {
    const {search} = useLocation()

    return useMemo(() => new URLSearchParams(search), [search])
}

const Place = () => {
    const [searchParams, setSearchParams] = useState(useQuery().get('id'));
    const [data, setData] = useState(null)
    const [index, setIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const [comment, setComment] = useState('')
    const [grade, setGrade] = useState('')
    const [comments, setComments] = useState(null)

    const fetchData = async (id) => {
        try {
            const data = await fetch('http://localhost:80/api/place?id=' + id)
            .then((response) => response.json())
            .then((results) => setData(results))
            return data
        }
        catch (error) {
            console.log(error)
            return null
        }
    }

    const fetchComments = async (id) => {
        try {
            const data = await fetch('http://localhost:80/api/comment?id_place=' + id)
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

    const handleChangeGrade = (e) => setGrade(e.target.value)
    const handleChangeComment = (e) => setComment(e.target.value)
    const handleWriteComment = () => setIsVisible(!isVisible)
    const handleSubmitComment = async () => {
        const token = window.localStorage.getItem('token')
        const timestamp = new Date()

        if (grade <= 0 || grade >= 6) {
            return window.alert('Insira uma nota válida!')
        }

        if (token)
            await fetch('http://localhost:80/api/comment', { method: 'POST', body: JSON.stringify({token, comment, grade: Math.floor(grade), timestamp: timestamp.toJSON(), id_place: searchParams}), headers: {
                "Content-type": "application/json; charset=UTF-8"
            }})
            .then(response => response.json())
            .then(result => result.success ? fetchComments(searchParams) : (!result.isUser ? window.alert('Você é local, não pode avaliar outros!') : window.alert('Erro ao comentar, tente novamente mais tarde!')))
        else window.alert('Você precisa estar logado para comentar!')
    }

    useEffect(() => {
        if (!searchParams) window.alert('Please provide a search')
        else {
            if (!data) {
                fetchData(searchParams)
            } else setTimeout(() => {
                try {
                    if (index + 1 >= data.photos.length) setIndex(0)
                    else setIndex(prevCount => prevCount + 1)
                } catch (e) {
                    console.log(e)
                }
            }, 5000)

            if (!comments) fetchComments(searchParams)
        }
    }, [searchParams, data, comments, index])

    if (data) {

        return (
            <div className="screen">
                <Header />
                <main className="container">
                    <div className="data-area item-container">
                        <img src={"http://localhost:80" + data.photos[index].photo_url} />
                        <h2>{data.place_details.placename}</h2>
                        <div className="item-data">
                            <AiFillMail size={"32px"}/>
                            <div className="info">
                                <p>{data.place_details.email}</p>
                            </div>
                        </div>
                        <div className="item-data">
                            <FaMapMarkerAlt size={"32px"} />
                            <div className="info">
                                <p>{data.place_details.address}</p>
                                <p>{data.place_details.city}</p>
                            </div>
                        </div>
                    </div>
                    <div className="comments-area item-container">
                        <h2>Comentários</h2>
                        {isVisible ? <button onClick={handleWriteComment}>Cancelar comentário</button> : <button onClick={handleWriteComment}>Escrever comentário</button>}
                        {isVisible ? (
                            <div className="comment-box">
                                <textarea value={comment} onChange={handleChangeComment} type="text" className="comment-input" placeholder="Insira seu comentário, mas não esqueça de fazer uma crítica construtiva!" />
                                <input value={grade} onChange={handleChangeGrade} type='number' min={1} max={5} placeholder="Dê uma nota de 1 à 5"/>
                                <button onClick={handleSubmitComment}>Comentar</button>
                            </div>
                        ) : null}
                        {comments ? comments.map((comment, index) => (
                            <div key={index} className="item-comment">
                                <h3>{comment.username}</h3>
                                <p>Publicado em <b>{(() => {
                                    // 2022-06-27T14:12:05.827Z
                                    let date = comment.timestamp.split('T')[0]
                                    
                                    let newDate = date.split('-')[2] + '/' + date.split('-')[1] + '/' + date.split('-')[0]
                                    
                                    return newDate
                                    })()}</b></p>
                                <p>Nota: {comment.grade}/5</p>
                                <p>{comment.comment}</p>
                            </div>
                        )): null}
                    </div>
                </main>
                <Footer />
            </div>
        )
    }
    
}

export default Place