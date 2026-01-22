import Link from 'next/link'
import { GraduationCap, Target, Users, Award, Heart, Sparkles } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary">Mwero Tech Academy</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/courses" className="text-foreground hover:text-primary transition-colors">
                Courses
              </Link>
              <Link href="/about" className="text-primary font-semibold">
                About
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              About Mwero Tech Academy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering the next generation of tech professionals through quality education, 
              expert mentorship, and cutting-edge technology
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Target className="w-4 h-4" />
                  Our Mission
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-6">
                  Making Tech Education Accessible to Everyone
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  At Mwero Tech Academy, we believe that quality tech education should be accessible 
                  to anyone with the passion to learn. We're breaking down barriers and creating 
                  pathways for aspiring tech professionals to achieve their dreams.
                </p>
                <p className="text-lg text-gray-600">
                  Our platform combines the best of traditional instruction with modern AI-powered 
                  learning tools to deliver a personalized, effective learning experience.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-12 flex items-center justify-center">
                <GraduationCap className="w-48 h-48 text-primary/40" />
              </div>
            </div>

            {/* Values */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-8 border border-border text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Excellence</h3>
                <p className="text-gray-600">
                  We maintain the highest standards in our courses, instructors, and support to 
                  ensure our learners receive world-class education.
                </p>
              </div>

              <div className="bg-card rounded-xl p-8 border border-border text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Community</h3>
                <p className="text-gray-600">
                  We foster a supportive learning community where students, instructors, and 
                  industry professionals connect and grow together.
                </p>
              </div>

              <div className="bg-card rounded-xl p-8 border border-border text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Innovation</h3>
                <p className="text-gray-600">
                  We leverage cutting-edge technology like AI-powered grading and personalized 
                  learning paths to enhance the educational experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Story</h2>
              <p className="text-xl text-gray-600">
                How Mwero Tech Academy came to be
              </p>
            </div>

            <div className="bg-card rounded-xl p-8 md:p-12 border border-border">
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2024, Mwero Tech Academy was born from a simple observation: traditional 
                tech education wasn't keeping pace with the rapidly evolving industry. Students needed 
                more flexibility, personalized feedback, and real-world skills.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We set out to create a platform that combines the best of both worlds—the structured 
                learning of traditional education with the flexibility and innovation of modern technology. 
                By integrating AI-powered tools, expert instructors, and a supportive community, we've 
                built something truly special.
              </p>
              <p className="text-lg text-gray-600">
                Today, we're proud to serve hundreds of learners across the globe, helping them launch 
                successful tech careers. Our graduates work at leading tech companies, run their own 
                startups, and continue to push the boundaries of what's possible in technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">By The Numbers</h2>
              <p className="text-xl text-gray-600">
                Our impact in the tech education space
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">500+</div>
                <div className="text-gray-600 font-medium">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-secondary mb-2">50+</div>
                <div className="text-gray-600 font-medium">Expert Courses</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-accent mb-2">95%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Join Our Learning Community
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start your journey towards a successful tech career today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Courses
            </Link>
            <Link
              href="/contact"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-primary">Mwero Tech</span>
              </div>
              <p className="text-gray-600 text-sm">
                Empowering the next generation of tech professionals
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/courses" className="hover:text-primary">Courses</Link></li>
                <li><Link href="/instructors" className="hover:text-primary">Instructors</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Mwero Tech Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
