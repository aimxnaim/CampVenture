const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container text-center">
        <p className="mb-1">&copy; {new Date().getFullYear()} CampVenture. All rights reserved.</p>
        <small className="text-secondary">Discover and share the best camping spots across Malaysia.</small>
      </div>
    </footer>
  );
};

export default Footer;
