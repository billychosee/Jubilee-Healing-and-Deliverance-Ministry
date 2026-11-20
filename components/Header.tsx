export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="brand" aria-label="Jubilee Healing and Deliverance Ministry">
          <svg className="logo" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="30" fill="#0b4aa8" />
            <circle cx="32" cy="32" r="22" fill="none" stroke="#d9a22b" strokeWidth="3" />
            <path
              d="M32 14l5 14h14l-11 9 4 14-12-8-12 8 4-14-11-9h14z"
              fill="#fff"
            />
          </svg>
        </a>
        <nav aria-label="Main">
          <ul className="nav">
            <li><a href="#top">Home</a></li>
            <li><a href="#history">About</a></li>
            <li><a href="#contact">Give</a></li>
          </ul>
        </nav>
        <a className="btn btn-solid" href="#contact">
          Contact Us
        </a>
      </div>
    </header>
  );
}
