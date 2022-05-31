import '../Styles/Card.css'

const Card = ({id, photos, placename, address}) => {
    return (
        <div id={id} className="card">
            <img src={'https://diariodocomercio.com.br/wp-content/uploads/2021/11/starbucks-uberlandia-2611.jpg'} alt="Photo"/>
            <div className="container">
                <h4><b>{placename}</b></h4>
                <p>{address}</p>
            </div>
        </div>
    )
}

export default Card