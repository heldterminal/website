import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page with contact section hash
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};

export default Contact;