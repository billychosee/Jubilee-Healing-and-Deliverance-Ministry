export default function Banner() {
  return (
    <section className="container">
      <div className="banner">
        <img
          src="https://placehold.co/1440x640?text=Banner+Image"
          alt="Placeholder: congregation worshipping"
          width={1440}
          height={640}
          loading="eager"
        />
        <div className="banner-overlay">
          <p className="banner-title">
            Freedom, Healing and Deliverance is My Portion!
          </p>
          <p className="banner-sub">
            We believe that through Christ, every chain can be broken and every
            life can experience true freedom.
          </p>
          <blockquote>
            John 8:36 (KJV) &quot;If the Son therefore shall make you free, ye shall be free indeed.&quot;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
