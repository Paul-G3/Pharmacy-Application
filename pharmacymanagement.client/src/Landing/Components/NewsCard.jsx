function formatDate(dateString) {
    const dateObj = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return dateObj.toLocaleDateString(undefined, options);
}

function NewsCard({ EventName, description, date }) {
    return (
        <>
            <div className="NewsCard">
                <h1 className="slider-heading">{EventName}</h1>
                <p className="slider-main-text">{description}</p>
                <br />
                <p className="date">{formatDate(date)}</p>
                <i className="fa-solid fa-disease"></i>
            </div>
        </>
    );
}
export default NewsCard