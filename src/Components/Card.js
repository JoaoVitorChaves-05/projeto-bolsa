import '../Styles/Card.css'

const Card = ({id, photos, placename, address}) => {
    const redirect = () => window.location.href = '/Place?id=' + id
    return (
        <div onClick={redirect} id={id} className="card">
            <img src={'http://localhost:80' + photos[0].photo_url} alt="Photo"/>
            <div className="container">
                <h4><b>{placename}</b></h4>
                <p>{address}</p>
            </div>
        </div>
    )
}

export default Card