import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";

export default function Landing() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <>
      <Navbar onSignIn={handleSignIn} />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </>
  );
}