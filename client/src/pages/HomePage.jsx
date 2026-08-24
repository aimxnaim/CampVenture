import { Link } from 'react-router-dom';
import '../styles/home.css';

const HomePage = () => {
  return (
    <section className="home-hero">
      <div className="home-hero-content">
        <h1>CampVenture</h1>
        <p>
          Welcome to CampVenture! Discover Malaysia&apos;s most breathtaking camping spots, share your own hidden gems, and
          connect with fellow outdoor enthusiasts.
        </p>
        <Link className="btn btn-lg btn-secondary home-cta" to="/campgrounds">
          Explore Campgrounds
        </Link>
        <footer className="home-footer">
          <p className="mb-0">&copy; {new Date().getFullYear()} CampVenture</p>
        </footer>
      </div>
    </section>
  );
};

export default HomePage;
