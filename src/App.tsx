import React from 'react';

function App() {
    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="container-custom section">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4">
                        Welcome to <span className="gradient-text">DevTogether</span>
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                        Connecting early-career developers with nonprofits through real-world projects
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="card-hover animate-fade-in">
                        <h2 className="text-2xl font-semibold mb-3 text-primary-700">For Developers</h2>
                        <p className="text-neutral-600 mb-4">
                            Build your portfolio with meaningful projects that make a difference
                        </p>
                        <button className="btn-primary">Get Started</button>
                    </div>

                    <div className="card-hover animate-fade-in animation-delay-100">
                        <h2 className="text-2xl font-semibold mb-3 text-secondary-700">For Nonprofits</h2>
                        <p className="text-neutral-600 mb-4">
                            Find talented developers to help bring your vision to life
                        </p>
                        <button className="btn-secondary">Learn More</button>
                    </div>

                    <div className="card-hover animate-fade-in animation-delay-200">
                        <h2 className="text-2xl font-semibold mb-3 text-neutral-700">How It Works</h2>
                        <p className="text-neutral-600 mb-4">
                            Simple process to connect, collaborate, and create impact
                        </p>
                        <button className="btn-outline">Explore</button>
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-2xl font-semibold mb-6">Key Features</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="badge-primary">Project Management</span>
                        <span className="badge-secondary">Real-time Messaging</span>
                        <span className="badge-success">Skill Building</span>
                        <span className="badge-warning">Portfolio Growth</span>
                        <span className="badge-error">Application Tracking</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App; 