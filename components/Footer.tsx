export default function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-container">
        <div className="footer-left">
          <a href="#" className="footer-logo" aria-label="Home">
            <img src="/JIM_lOGO.png" alt="Jubilee Healing and Deliverance Ministry logo" className="footer-logo-img" />
          </a>
          <div className="footer-address">
            <p>123 Church St. #23A</p>
            <p>Dallas, Texas 44635</p>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <a href="#">Home</a>
            <a href="#">Departments</a>
            <a href="#">Gallery</a>
            <a href="#">Shop</a>
            <a href="#">Community Services</a>
          </div>
          <div className="footer-col">
            <a href="#">About</a>
            <a href="#">Events</a>
            <a href="#">Sermons</a>
            <a href="#">Give</a>
            <a href="#">Contact</a>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-contact">
            <p>(454) 568-4588</p>
            <p>AFMDA@gmail.com</p>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>&copy; 2025 Jubilee_Healing. All rights reserved.</p>
      </div>
    </footer>
  );
}
