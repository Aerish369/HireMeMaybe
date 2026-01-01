import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Buttons.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";

import { Briefcase, Search, Users, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Find Your <span className="text-black font-semibold">Dream Job</span> Today
            </h1>

            <p className="text-xl text-gray-700 mb-8">
              Connect with top employers and discover opportunities that match your skills and aspirations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/jobs">
                <Button variant="primary" size="xl">
                  <Search className="w-5 h-5 mr-2" /> Browse Jobs
                </Button>
              </Link>

              {!isAuthenticated() && (
                <Link to="/register">
                  <Button variant="outline" size="xl">
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Why Choose JobPortal?</h2>
              <p className="mt-4 text-gray-700">Everything you need to advance your career</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[{
                icon: <Briefcase className="w-8 h-8 text-black" />,
                title: "Thousands of Jobs",
                description: "Access a wide variety of opportunities from companies of all sizes."
              }, {
                icon: <Users className="w-8 h-8 text-black" />,
                title: "Top Employers",
                description: "Connect with leading companies looking for talented professionals."
              }, {
                icon: <CheckCircle className="w-8 h-8 text-black" />,
                title: "Easy Apply",
                description: "Apply with just one click and track your application progress."
              }].map((feature, i) => (
                <div key={i} className="bg-white rounded-xl p-8 border border-black shadow-sm text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-gray-700 mb-8">
              Join thousands of professionals who found their dream jobs with JobPortal.
            </p>

            <Link to={isAuthenticated() ? "/jobs" : "/register"}>
              <Button variant="primary" size="xl">
                {isAuthenticated() ? "Browse Jobs" : "Sign Up Free"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
