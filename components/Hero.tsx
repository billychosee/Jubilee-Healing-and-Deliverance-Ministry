export default function Hero() {
  return (
    <section className="hero container">
      <div className="hero-text">
        <p className="eyebrow">Jubilee Healing and Deliverance Ministry</p>
        <h1>Welcome to Jubilee Healing and Deliverance Ministry!</h1>
        <p>
          We warmly welcome you to Jubilee Healing and Deliverance Ministry,
          where our desire is to see lives transformed through the power of
          Jesus Christ. Whether you are seeking healing, deliverance,
          restoration or spiritual growth, you are welcome here.
        </p>
        <div className="btn-row">
          <a className="btn btn-solid" href="#history">
            Our History and Foundation
          </a>
          <a className="btn btn-outline" href="#vision">
            Our Vision and Commitment
          </a>
        </div>
      </div>
      <div className="hero-media">
        <span className="deco-quarter" aria-hidden="true"></span>
        <span className="deco-dots dots-tr" aria-hidden="true"></span>
        <span className="deco-dots dots-bl" aria-hidden="true"></span>
        <img
          src="https://placehold.co/640x760?text=Hero+Image"
          alt="Placeholder: people celebrating together"
          width={640}
          height={760}
          loading="eager"
        />
      </div>
    </section>
  );
}
