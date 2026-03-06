import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import GenericLogo from '../components/GenericLogo';

const Home = () => {
  const { t } = useLanguage();
  const { settings } = useSettings();

  const titleParts = settings.app_title.split(' ');
  const firstPart = titleParts[0];
  const secondPart = titleParts.slice(1).join(' ');

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-logo-wrapper">
            {settings.app_logo ? (
              <img src={settings.app_logo} alt="Logo" className="hero-logo" />
            ) : (
              <GenericLogo className="hero-logo-generic" />
            )}
          </div>
          <h1 className="hero-title">{firstPart} <span className="text-gradient">{secondPart}</span>.</h1>
          <p className="hero-subtitle">
            {settings.home_description}
          </p>
          <div className="hero-buttons">
            <Link to="/members" className="btn btn-primary hero-btn">{t('home.exploreMembers')}</Link>
            <Link to="/events" className="btn btn-outline hero-btn">{t('home.upcomingEvents')}</Link>
          </div>
        </div>
      </section>

      <style>{`
        .hero {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: radial-gradient(circle at center, var(--primary-glow) 0%, transparent 70%);
          position: relative;
        }
        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }
        .text-gradient {
          color: var(--primary);
          font-weight: 900;
          text-shadow: 0 0 20px var(--primary-shadow);
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 2.5rem;
        }
        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .hero-btn {
          padding: 0.75rem 2rem;
          font-size: 1.1rem;
        }
        .hero-logo-wrapper {
            display: flex;
            justify-content: center;
            margin-bottom: 2rem;
            animation: float 6s ease-in-out infinite;
        }
        .hero-logo, .hero-logo-generic {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 4px solid var(--accent);
            box-shadow: 0 0 20px var(--primary-semi);
            object-fit: cover;
        }
        .hero-logo-generic {
            background: var(--bg-card);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--accent);
            padding: 2rem;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default Home;
