export default function Values() {
  const values = [
    {
      icon: (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 12l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      title: "Freedom",
      body: "Breaking spiritual bondages and bringing people into the liberty found in Christ.",
    },
    {
      icon: (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.7A4.5 4.5 0 0120 10c0 6-8 11-8 11z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      title: "Healing",
      body: "Trusting God for physical, emotional and spiritual restoration.",
    },
    {
      icon: (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      title: "Deliverance",
      body: "Ministering to those seeking freedom from spiritual oppression and bondage.",
    },
    {
      icon: (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20V10l8-6 8 6v10z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      title: "Restoration",
      body: "Helping individuals rediscover hope, purpose and their identity in Christ.",
    },
    {
      icon: (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="17" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M3 20c0-4 3-6 6-6s6 2 6 6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      title: "Community Impact",
      body: "Extending God's love beyond the church through practical initiatives that uplift and empower communities.",
    },
  ];

  return (
    <section id="vision" className="container vision">
      <div className="vision-head">
        <h2>Our Vision and Commitment</h2>
        <p>
          Jubilee Healing and Deliverance Ministry exists to proclaim the Gospel
          of Jesus Christ and to see lives transformed through His healing and
          delivering power.
        </p>
        <p className="believe">We believe in:</p>
      </div>
      <ul className="values">
        {values.map((v, i) => (
          <li key={i}>
            {v.icon}
            <h3>{v.title}</h3>
            <p>{v.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
