import { useLanguage } from '../context/LanguageContext';

const AboutUs = () => {
    const { t } = useLanguage();

    return (
        <div className="container about-page">
            <header className="page-header">
                <h1 className="page-title">{t('about.title')}</h1>
                <p className="page-subtitle">{t('about.subtitle')}</p>
            </header>

            <div className="about-content">
                {/* History Section */}
                <section className="about-section">
                    <div className="section-text">
                        <h2>{t('about.history.title')}</h2>
                        <p>{t('about.history.text')}</p>
                    </div>
                    <div className="section-image">
                        <img src="/offroad1.png" alt="Offroad in mud" className="about-img" />
                    </div>
                </section>

                {/* Mission Section */}
                <section className="about-section reverse">
                    <div className="section-image">
                        <img src="/offroad2.png" alt="River crossing" className="about-img" />
                    </div>
                    <div className="section-text">
                        <h2>{t('about.mission.title')}</h2>
                        <p>{t('about.mission.text')}</p>
                    </div>
                </section>

                {/* Philanthropy Section */}
                <section className="about-section">
                    <div className="section-text">
                        <h2>{t('about.philanthropy.title')}</h2>
                        <p>{t('about.philanthropy.text')}</p>
                    </div>
                    <div className="section-image">
                        <img src="/offroad3.png" alt="Extreme trail" className="about-img" />
                    </div>
                </section>

                {/* Call to Action */}
                <section className="about-cta card">
                    <h2>{t('about.join.title')}</h2>
                    <p>{t('about.join.text')}</p>
                    <a
                        href="https://www.instagram.com/offroadmaringa/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >
                        📸 {t('about.followUs')}
                    </a>
                </section>
            </div>

            <style>{`
                .about-page {
                    padding: 2rem 0;
                }
                .page-subtitle {
                    font-size: 1.25rem;
                    color: var(--text-secondary);
                    text-align: center;
                    margin-top: 0.5rem;
                }
                .about-content {
                    margin-top: 3rem;
                }
                .about-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    margin-bottom: 4rem;
                    align-items: center;
                }
                .about-section.reverse {
                    direction: rtl;
                }
                .about-section.reverse > * {
                    direction: ltr;
                }
                .section-text h2 {
                    color: var(--primary);
                    margin-bottom: 1rem;
                }
                .section-text p {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: var(--text-secondary);
                }
                .section-image {
                    position: relative;
                }
                .about-img {
                    width: 100%;
                    height: 400px;
                    object-fit: cover;
                    border-radius: 1rem;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    transition: transform 0.3s;
                }
                .about-img:hover {
                    transform: scale(1.02);
                }
                .about-cta {
                    text-align: center;
                    padding: 3rem;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border: 1px solid var(--primary);
                }
                .about-cta h2 {
                    color: var(--primary);
                    margin-bottom: 1rem;
                }
                .about-cta p {
                    font-size: 1.2rem;
                    margin-bottom: 2rem;
                    color: var(--text-secondary);
                }
                @media (max-width: 768px) {
                    .about-section {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    .about-section.reverse {
                        direction: ltr;
                    }
                    .about-img {
                        height: 300px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AboutUs;
