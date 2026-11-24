import GlareHover from "@/components/GlareHover";

export default function Banner() {
  return (
    <section className="container">
      <GlareHover
        width="100%"
        height="auto"
        borderRadius="16px"
        mode="hover"
        variant="streak"
        glareOpacity={0.35}
        glareSize={28}
        glareAngle={-35}
        intro
      >
        <div className="banner">
        <img
          src="/middle-section.png"
          alt="Congregation worshipping"
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
      </GlareHover>
    </section>
  );
}
