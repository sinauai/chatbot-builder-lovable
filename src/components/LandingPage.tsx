
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Github, Bot, Zap, Shield, Code } from 'lucide-react';

export function LandingPage() {
  const { user, signInWithGitHub } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Chatbot <span className="text-blue-600">Kompas</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform untuk membangun dan mendeploy chatbot dengan mudah berdasarkan template repository yang tersedia. 
            Buat chatbot cerdas untuk berbagai keperluan hanya dalam beberapa langkah.
          </p>
          
          {!user && (
            <Button onClick={signInWithGitHub} size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
              <Github className="w-5 h-5 mr-2" />
              Mulai dengan GitHub
            </Button>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Bot className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-lg">Template Siap Pakai</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pilih dari berbagai template chatbot yang sudah disiapkan untuk berbagai kebutuhan
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-lg">Deploy Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Deploy chatbot Anda ke Vercel dengan satu klik dan langsung dapat digunakan
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-lg">Keamanan Terjamin</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Autentikasi GitHub dan sistem role yang aman untuk melindungi data Anda
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Code className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-lg">Kustomisasi Mudah</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Atur knowledge base, pertanyaan contoh, dan konfigurasi chatbot dengan interface yang intuitif
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Cara Kerja</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Pilih Template</h3>
              <p className="text-gray-600">
                Pilih template repository chatbot yang sesuai dengan kebutuhan Anda
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Kustomisasi</h3>
              <p className="text-gray-600">
                Atur title, knowledge base, dan pertanyaan contoh sesuai kebutuhan
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Deploy</h3>
              <p className="text-gray-600">
                Deploy chatbot Anda ke Vercel dan mulai gunakan
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Siap untuk Memulai?
            </h2>
            <p className="text-gray-600 mb-6">
              Masuk dengan akun GitHub Anda dan mulai buat chatbot pertama Anda
            </p>
            <Button onClick={signInWithGitHub} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Github className="w-5 h-5 mr-2" />
              Masuk dengan GitHub
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
