"use client";

import StaggeredMenu from "@/components/StaggeredMenu";

const menuItems = [
  { label: "Home", ariaLabel: "Go to home page", link: "#top" },
  { label: "Our History", ariaLabel: "Learn about our history and foundation", link: "#history" },
  { label: "Contact Us", ariaLabel: "Get in touch", link: "#contact" }
];

const socialItems = [
  { label: "Facebook", link: "https://facebook.com" },
  { label: "Instagram", link: "https://instagram.com" },
  { label: "YouTube", link: "https://youtube.com" }
];

export default function Header() {
  return (
    <>
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        logoUrl="/JIM_lOGO.png"
        menuButtonColor="#0b4aa8"
        openMenuButtonColor="#0b4aa8"
        accentColor="#d9a22b"
        changeMenuColorOnOpen={true}
        closeOnClickAway={true}
        isFixed
        onMenuOpen={() => {}}
        onMenuClose={() => {}}
      />
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="brand" aria-label="Jubilee Healing and Deliverance Ministry">
            <img src="/JIM_lOGO.png" alt="Jubilee Healing and Deliverance Ministry logo" className="logo" />
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
    </>
  );
}
