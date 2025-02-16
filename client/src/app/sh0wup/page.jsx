'use client';
import React, { useState } from "react";
import Header from "@/components/LandingPage/Header";
import Hero from "@/components/LandingPage/Hero";
import Feature from "@/components/LandingPage/Feature";
import ContactUs from "@/components/LandingPage/ContactUs";
import Faq from "@/components/LandingPage/Faq";
import Footer from "@/components/LandingPage/Footer";

function Page() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
        <Header />
        <Hero />
        <Feature />
        <Faq />
        <ContactUs />
        <Footer />  
        </>
    );
}

export default Page;
