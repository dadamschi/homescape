import { useEffect } from "react";
import { CMSProvider } from "./data";
import useStore from "./store";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import ProjectsPage from "./components/ProjectsPage";
import AboutPage from "./components/AboutPage";
import TestimonialsPage from "./components/TestimonialsPage";
import ContactPage from "./components/ContactPage";
import Footer from "./components/Footer";
import "./styles.css";

const PAGES = {
    home: Hero,
    projects: ProjectsPage,
    about: AboutPage,
    testimonials: TestimonialsPage,
    contact: ContactPage,
};

function Router() {
    const currentPage = useStore((s) => s.currentPage);
    const setPage = useStore((s) => s.setPage);

    useEffect(() => {
        const handleHash = () => {
            const page = window.location.hash?.slice(1) || "home";
            setPage(page);
        };
        window.addEventListener("hashchange", handleHash);
        return () => window.removeEventListener("hashchange", handleHash);
    }, [setPage]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    const Page = PAGES[currentPage] || Hero;
    return <Page />;
}

export default function App() {
    return (
        <CMSProvider>
            <Nav />
            <Router />
            <Footer />
        </CMSProvider>
    );
}