import { navigate } from "../store";
import useCMS from "../data";
import Icons from "../Icons";

export default function Hero() {
  const { hero } = useCMS();

  if (!hero) return null;

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-label animate-fade-up">
          Residential &amp; Commercial
        </div>
        <h1 className="animate-fade-up animate-delay-1">
          {hero.headline}
        </h1>
        <p className="animate-fade-up animate-delay-2">
          {hero.story}
        </p>
        <div className="hero-buttons animate-fade-up animate-delay-3">
          <button
            className="btn btn-primary"
            onClick={() => navigate("projects")}
          >
            View Our Work {Icons.arrow}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("contact")}
          >
            Start Your Project
          </button>
        </div>
      </div>
    </section>
  );
}
