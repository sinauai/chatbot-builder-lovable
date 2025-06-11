
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Github, LogOut } from 'lucide-react';

export function Header() {
  const { user, userRole, signInWithGitHub, signOut } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-blue-600">Chatbot Kompas</h1>
          {user && userRole && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {userRole === 'admin' ? 'Admin' : 'User'}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">{user.user_metadata.user_name}</span>
              </div>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          ) : (
            <Button onClick={signInWithGitHub} className="bg-gray-900 hover:bg-gray-800">
              <Github className="w-4 h-4 mr-2" />
              Masuk dengan GitHub
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
