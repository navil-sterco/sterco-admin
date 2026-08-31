import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import './page-auth.css'
import { AuthWrapper } from "./AuthWrapper";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        password: '',
        email: '',
        rememberMe: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            const { token, user } = response.data;

            if (formData.rememberMe) {
                localStorage.setItem('authToken', token);
                sessionStorage.removeItem('authToken');
            } else {
                sessionStorage.setItem('authToken', token);
                localStorage.removeItem('authToken');
            }

            login(user, token);
            navigate('/');
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Invalid email or password. Please try again.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthWrapper>
            <h4 className="mb-2">Sterco Digitex 👋 </h4>
            <p className="mb-4">Please sign-in to your account and start the adventure</p>

            {error && (
                <div className="alert alert-danger mb-3" role="alert">
                    {error}
                </div>
            )}

            <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email or Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        name="email"
                        placeholder="Enter your email or username"
                        autoFocus
                        disabled={isSubmitting} />
                </div>
                <div className="mb-3 form-password-toggle">
                    <div className="d-flex justify-content-between">
                        <label className="form-label" htmlFor="password">Password</label>
                        <Link aria-label="Go to Forgot Password Page" to="/auth/forgot-password">
                            <small>Forgot Password?</small>
                        </Link>
                    </div>
                    <div className="input-group input-group-merge">
                        <input
                            type="password"
                            autoComplete="current-password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control"
                            name="password"
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                            aria-describedby="password"
                            disabled={isSubmitting} />
                        <span className="input-group-text cursor-pointer"></span>
                    </div>
                </div>
                <div className="mb-3">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="remember-me"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        <label className="form-check-label" htmlFor="remember-me"> Remember Me </label>
                    </div>
                </div>
                <div className="mb-3">
                    <button
                        aria-label='Click me'
                        className="btn btn-primary d-grid w-100"
                        type="submit"
                        disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>

            <p className="text-center">
                <span>New on our platform? </span>
                <Link aria-label="Go to Register Page" to='/auth/register' className="registration-link">
                    <span>Create an account</span>
                </Link>
            </p>
        </AuthWrapper>
    )
}