import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function AboutPage() {
  const developerTeam = [
    {
      id: 1,
      name: 'Reyes, Alexzander J',
      bio: 'Passionate about building secure and scalable healthcare solutions',
      avatar: '👨‍💻',
    },
    {
      id: 2,
      name: 'San Jose, Alexander B.',
      bio: 'Expert in API design and database architecture',
      avatar: '👨‍💼',
    },
    {
      id: 3,
      name: 'Sembero, Christian Dane D.',
      bio: 'UI/UX specialist with passion for healthcare tech',
      avatar: '👩‍💻',
    },
    {
      id: 4,
      name: 'Titong, Lee Ivan B.',
      bio: 'Infrastructure expert ensuring system reliability and security',
      avatar: '👨‍🔧',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">About Secure EMR</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A modern, secure, and comprehensive Electronic Medical Records system built with cutting-edge technology
        </p>
      </div>

      {/* Mission and Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission */}
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-3xl">🎯</span>
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              To revolutionize healthcare delivery by providing a secure, efficient, and user-friendly Electronic Medical Records system that prioritizes patient privacy, data integrity, and accessibility.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Key Objectives:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Ensure HIPAA-compliant data protection</li>
                <li>Enable seamless collaboration between healthcare providers</li>
                <li>Reduce medical errors through better record management</li>
                <li>Improve patient engagement and transparency</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-3xl">🌟</span>
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              To create a world where healthcare information is seamlessly accessible, secure, and interoperable across all healthcare settings, empowering providers and patients alike.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Future Goals:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Expand to multiple healthcare organizations</li>
                <li>Integrate AI-powered diagnostic support</li>
                <li>Support multi-language and accessibility features</li>
                <li>Achieve full interoperability with national health networks</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="text-2xl">Core Values</CardTitle>
          <CardDescription>The principles that guide our development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🔐 Security</h3>
              <p className="text-sm text-blue-700">
                End-to-end encryption and robust security protocols to protect sensitive patient data
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ Reliability</h3>
              <p className="text-sm text-green-700">
                High availability and fault tolerance for mission-critical healthcare operations
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">👥 Usability</h3>
              <p className="text-sm text-purple-700">
                Intuitive interface designed with medical professionals and patients in mind
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">🔄 Compliance</h3>
              <p className="text-sm text-orange-700">
                Adherence to healthcare standards and regulatory requirements worldwide
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card className="border-2 border-indigo-100">
        <CardHeader>
          <CardTitle className="text-2xl">Technology Stack</CardTitle>
          <CardDescription>Built with modern, proven technologies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Frontend</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">▸</span> React
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">▸</span> TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">▸</span> Tailwind CSS
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">▸</span> Vite
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Backend</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">▸</span> Flask
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">▸</span> Python
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">▸</span> SQLAlchemy
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">▸</span> JWT Authentication
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Infrastructure</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">▸</span> Docker
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">▸</span> PostgreSQL
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">▸</span> Ubuntu/OpenStack
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">▸</span> RBAC & Audit Logs
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Team */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Developer Team</h2>
          <p className="text-gray-600">
            Meet the talented developers behind Secure EMR
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developerTeam.map((dev) => (
            <Card key={dev.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{dev.avatar}</div>
                  <div>
                    <CardTitle className="text-xl">{dev.name}</CardTitle>
                    <CardDescription className="text-blue-600 font-semibold">
                      {dev.role}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{dev.bio}</p>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <a
                    href={`mailto:${dev.email}`}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Email"
                  >
                    <Mail className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                  </a>
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-5 h-5 text-gray-600 hover:text-gray-900" />
                  </a>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Highlight */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-900">Patient Records Management</h4>
                <p className="text-sm text-gray-600">Comprehensive patient profiles with medical history</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-900">Role-Based Access Control</h4>
                <p className="text-sm text-gray-600">Granular permissions for different user roles</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-900">Audit Logging</h4>
                <p className="text-sm text-gray-600">Complete audit trail of all system activities</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-900">Secure Communication</h4>
                <p className="text-sm text-gray-600">End-to-end encrypted data transmission</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-900">Multi-User Support</h4>
                <p className="text-sm text-gray-600">Doctors, nurses, admins, and patients</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-900">Real-time Dashboard</h4>
                <p className="text-sm text-gray-600">Live system activity and analytics</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card className="border-2 border-green-100 bg-green-50">
        <CardHeader>
          <CardTitle className="text-2xl">Get in Touch</CardTitle>
          <CardDescription>Have questions or feedback? We'd love to hear from you</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Secure EMR is an open project dedicated to improving healthcare delivery through secure, efficient, and user-friendly technology. Whether you have feedback, feature requests, or want to contribute to our mission, please reach out.
          </p>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> support@secureemr.com</p>
            <p><strong>GitHub:</strong> github.com/secureemr</p>
            <p><strong>Documentation:</strong> docs.secureemr.com</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 border-t">
        <p className="text-gray-600">
          © 2026 Secure EMR. All rights reserved. Built with ❤️ for healthcare providers and patients.
        </p>
      </div>
    </div>
  );
}
