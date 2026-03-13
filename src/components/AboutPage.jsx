import CMS_DATA from "../data";

export default function AboutPage() {
    const { aboutContent } = CMS_DATA;

    return (
        <div className="page">
            <div className="container section">
                <div className="about-grid">
                    <div>
                        <div className="section-label animate-fade-up">About Us</div>
                        <h2 className="section-title animate-fade-up animate-delay-1">
                            {aboutContent.headline}
                        </h2>
                        <p className="about-story animate-fade-up animate-delay-2">
                            {aboutContent.story}
                        </p>
                        <div className="values-list animate-fade-up animate-delay-3">
                            {aboutContent.values.map((v, i) => (
                                <div key={i}>
                                    <div className="value-item-title">{v.title}</div>
                                    <div className="value-item-desc">{v.description}</div>
                                </div>
                            ))}
                        </div>
                        <div className="stats-row animate-fade-up animate-delay-4">
                            {aboutContent.stats.map((s, i) => (
                                <div key={i}>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <img
                        className="about-image animate-fade-in animate-delay-2"
                        src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
                        alt="Construction team at work"
                        loading="lazy"
                    />
                </div>
            </div>
        </div>
    );
}