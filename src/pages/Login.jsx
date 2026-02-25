import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';


const Login = () => {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingSub, setLoadingSub] = useState(false);

    const { login, user, loading } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoadingSub(true);

        try {
            const identifier = username.trim();
            const loggedUser = await login(identifier, password);
            if (loggedUser) {
                navigate('/');
            } else {
                setError(t('login.error'));
            }
        } catch (err) {
            // Check if error message is a translation key
            const translated = t(err.message);
            if (translated !== err.message) {
                setError(translated);
            } else if (err.message === 'Invalid email or password') {
                setError(t('login.error'));
            } else {
                setError(err.message);
            }
        } finally {
            setLoadingSub(false);
        }

    };

    return (
        <div className="container login-page">
            <div className="card login-card">
                <h1>{t('login.title')}</h1>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('member.username')}</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('login.password')}</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loadingSub}>
                        {loadingSub ? t('login.loggingIn') : t('login.button')}
                    </button>
                </form>
            </div>


            <style>{`
                .login-page {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 70vh;
                    padding: 2rem;
                }
                .login-card {
                    width: 100%;
                    max-width: 450px;
                    padding: 2.5rem;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 2rem;
                    color: var(--primary);
                }
                .error-message {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-size: 0.9rem;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .success-message {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-size: 0.9rem;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }
                .btn-primary {
                    width: 100%;
                    margin-top: 1.5rem;
                }
            `}</style>
        </div>
    );
};

export default Login;

