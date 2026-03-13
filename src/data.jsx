// --- MOCK CMS DATA (Sanity.io shape) ----------------------------------------
// This mock data mirrors the shape returned by GROQ queries.
// When Sanity is wired up, replace these with live fetches from sanityClient.
// See src/sanity.js for client config and query examples.

const CMS_DATA = {
    siteSettings: {
        companyName: "Homescape Construction",
        tagline: "Building dreams from the ground up",
        phone: "(555) 234-7890",
        email: "info@homescapeconstruction.com",
        social: {
            facebook: "https://facebook.com/homescape",
            instagram: "https://instagram.com/homescape",
            linkedin: "https://linkedin.com/company/homescape",
        },
    },
    projects: [
        {
            _id: "p1",
            title: "Riverside Modern",
            category: "Residential",
            description:
                "A contemporary riverside home featuring floor-to-ceiling windows and sustainable materials throughout.",
            image:
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
            year: "2025",
            location: "Portland, OR",
        },
        {
            _id: "p2",
            title: "Downtown Loft Conversion",
            category: "Commercial",
            description:
                "Historic warehouse transformed into modern mixed-use loft spaces with industrial character preserved.",
            image:
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
            year: "2024",
            location: "Seattle, WA",
        },
        {
            _id: "p3",
            title: "Hillside Retreat",
            category: "Residential",
            description:
                "Custom mountain home blending natural stone and timber with panoramic valley views.",
            image:
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
            year: "2025",
            location: "Bend, OR",
        },
        {
            _id: "p4",
            title: "Greenview Office Park",
            category: "Commercial",
            description:
                "LEED-certified office complex with biophilic design principles and energy-efficient systems.",
            image:
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
            year: "2024",
            location: "Tacoma, WA",
        },
        {
            _id: "p5",
            title: "Cedar Park Renovation",
            category: "Renovation",
            description:
                "Complete gut renovation of a 1940s bungalow, modernized while honoring its craftsman roots.",
            image:
                "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
            year: "2025",
            location: "Eugene, OR",
        },
        {
            _id: "p6",
            title: "Waterfront Commercial Hub",
            category: "Commercial",
            description:
                "Mixed-use waterfront development with retail, dining, and public gathering spaces.",
            image:
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
            year: "2024",
            location: "Olympia, WA",
        },
    ],
    testimonials: [
        {
            _id: "t1",
            name: "Sarah & David Mitchell",
            project: "Riverside Modern",
            quote:
                "Homescape turned our vision into something beyond what we imagined. The attention to detail was extraordinary — every corner of our home tells a story.",
            rating: 5,
        },
        {
            _id: "t2",
            name: "Marcus Chen",
            project: "Downtown Loft Conversion",
            quote:
                "Professional, communicative, and genuinely passionate about their craft. They delivered on time and the quality speaks for itself.",
            rating: 5,
        },
        {
            _id: "t3",
            name: "Elena Rodriguez",
            project: "Cedar Park Renovation",
            quote:
                "They respected our budget, kept us informed every step of the way, and the final result exceeded all expectations. Our 1940s home feels brand new.",
            rating: 5,
        },
    ],
    locations: [
        {
            _id: "l1",
            name: "Main Office — Portland",
            address: "742 NW Industrial Ave, Portland, OR 97209",
            phone: "(555) 234-7890",
            hours: "Mon–Fri 8am–5pm",
        },
        {
            _id: "l2",
            name: "Seattle Branch",
            address: "1200 First Ave S, Suite 310, Seattle, WA 98134",
            phone: "(555) 234-7891",
            hours: "Mon–Fri 9am–5pm",
        },
    ],
    aboutContent: {
        headline: "Craftsmanship meets innovation",
        story: "Founded in 2012, Homescape Construction began with a simple belief: that every structure we build should enhance the lives of those who use it. From custom homes to commercial developments, we bring together skilled craftspeople, sustainable practices, and forward-thinking design to create spaces that endure.",
        values: [
            {
                title: "Quality First",
                description:
                    "We never cut corners. Every joint, every finish, every detail meets our exacting standards.",
            },
            {
                title: "Transparent Process",
                description:
                    "Open communication and honest timelines — you'll always know where your project stands.",
            },
            {
                title: "Sustainable Building",
                description:
                    "We prioritize eco-friendly materials and energy-efficient construction methods.",
            },
        ],
        stats: [
            { label: "Projects Completed", value: "200+" },
            { label: "Years of Experience", value: "13" },
            { label: "Client Satisfaction", value: "98%" },
        ],
    },
};

export default CMS_DATA;