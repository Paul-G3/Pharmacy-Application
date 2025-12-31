import '../landingcss/landingPage.css'
import NewsCard from './NewsCard'
import LoginSection from './loginSection'
import React, { useEffect, useState } from "react"
import { getData } from '../../SharedComponents/apiService'
import Loader from '../../SharedComponents/Loader'

function Main() {
    const [Events, SetEvemts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        const GetEvwnts = async () => {
            try {
                setLoading(true)
                var result = await getData('/manager/Info/Events')
                const activeEvents = result.filter(event => event.eventStatus === "Active");
                SetEvemts(activeEvents);
                console.log(activeEvents);
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        GetEvwnts()

    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === Events.length - 1 ? 0 : prevIndex + 1
            );
        }, 10000);

        return () => clearInterval(interval);
    }, [Events]);
    return (
        
        <>
            <Loader isLoading={loading} />
                <section className="hero">
                <div className="hero-text">
                    <div className="TextSlider"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                            transition: "transform 0.5s ease-in-out",
                            display: "flex",
                        }}>
                        {
                            Events.map((news) => (
                                <NewsCard
                                    key={news.eventsID}
                                    EventName={news.eventName}
                                    description={news.eventDescription}
                                    date={news.eventDate}
                                    />
                        
                            ))
                        } 
                     </div>
                </div>
                    <div className="hero-image">
                    <div className="hero-front">
                       <div className="blur"></div>
                    </div>
                    <div className="textOnHero">
                        <h2>Seamless Pharmacy Management for Everyone</h2>
                        <br/>
                        <p>Manage prescriptions, stock, and customer care with ease. A system built for customers and pharmacy professionals alike.</p>
                       
                    </div>     
                    </div>
                </section>

            <div className="services-container" id="services">
                    <h2>Pharmacy Services</h2>
                <section >
                <div className="services">
                        <div className="service-box">
                            <p className="service-title">Prescription Refill Request</p>
                            <p>
                                Need a quick refill? Use our easy online form to request a repeat of
                                your current prescription. Our team will prepare it in advance so you
                                can collect it with no delays.
                            </p>
                        </div>

                        <div className="service-box">
                            <p className="service-title">New Prescription Upload</p>
                            <p>Received a new prescription? Simply upload a photo or PDF, and we’ll start
                                processing it right away.Save time and skip the queue!
                            </p>
                        </div>


                        <div className="service-box">
                            <p className="service-title">Medication Reminder Signup</p>
                            <p>Never miss a dose again! Sign up for our free SMS or email reminders
                                to stay on top of your medication schedule every day.</p>
                        </div>

                        <div className="service-box">
                            <p className="service-title">Home Delivery Service Info</p>
                            <p>We deliver medications straight to your door. Check if your area qualifies,
                                and enjoy the convenience of timely, safe delivery—especially helpful for elderly
                                or busy patients.</p>
                        </div>
                    </div>
                </section>
                </div>

                <section id="about" className="about">

                    <div className="about-picture">
                    </div>

                    <div className="about-contents">
                        <h3>About Health Hive</h3>
                        <p>Health Hive is a modern pharmacy management solution designed to streamline prescription services, medication stock management, and customer engagement. Whether you're a loyal customer refilling your prescription or a pharmacist managing a busy day, Health Hive is built for you. Easy to use, secure, and efficient.</p>
                    </div>

                </section>

            <LoginSection/>


         </>    
    )
}

export default Main;

