import { useState } from "react";

import '../Styles/Modal.css';

const Modal = ({isVisible, commentProps, controllState}) => {
    
    const [feedback, setFeedback] = useState('')

    const handleSubmit = (comment_id) => {

        const token = window.localStorage.getItem('token')

        if (token !== 'null') {

            const timestamp = new Date()

            const form = new FormData()

            form.append('id_comment', comment_id)
            form.append('feedback', feedback)
            form.append('timestamp', timestamp.toJSON())
            form.append('token', token)

            fetch('http://localhost:80/api/feedback', {method: 'POST', body: form})
            .then(response => response.json())
            .then(response => {
                console.log(response)

                if (response.success) window.alert('Resposta enviada!')
                else window.alert('Erro ao enviar resposta!')
                controllState({ isVisible: false, commentProps: null })
            })
            .catch(error => console.log(error))

        }
    }
    
    if (isVisible) {

        const {comment_id, comment, username, entrancegrade, bathroomgrade, interiorgrade, parkinggrade, timestamp} = commentProps

        return (
            <div className="modal">
                <div className="popup item-comment">
                    <h3>{username}</h3>
                    <p>Publicado em <b>{(() => {
                        // 2022-06-27T14:12:05.827Z
                        let date = timestamp.split('T')[0]
                        
                        let newDate = date.split('-')[2] + '/' + date.split('-')[1] + '/' + date.split('-')[0]
                        
                        return newDate
                        })()}</b></p>
                    <p>{comment}</p>
                    <p><b>Nota da entrada: </b>{entrancegrade}/5</p>
                    <p><b>Nota dos banheiros: </b>{bathroomgrade}/5</p>
                    <p><b>Nota do interior: </b>{interiorgrade}/5</p>
                    <p><b>Nota do estacionamento: </b>{parkinggrade}/5</p>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit(comment_id)
                    }}>
                        <textarea placeholder="Responda o comentário de seu cliente..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                        <button className="btn answer-btn" type="submit">Responder</button>
                        <button className="btn close-btn" type="button" onClick={() => controllState({ isVisible: false, commentProps: null})}>Fechar</button>
                    </form>
                </div>
            </div>
        )
    }
    else return null
}

export default Modal