import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Copy, Settings, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Repository {
  id: string;
  github_repo_name: string;
  github_repo_url: string;
  description: string;
}

interface UserRepository {
  id: string;
  github_repo_name: string;
  github_repo_url: string;
  chatbot_name: string;
  created_at: string;
  template_repo_id: string;
}

export function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Repository[]>([]);
  const [userRepos, setUserRepos] = useState<UserRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Repository | null>(null);
  const [chatbotName, setChatbotName] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch template repositories
      const { data: templatesData, error: templatesError } = await supabase
        .from('repositories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      // Fetch user repositories
      const { data: userReposData, error: userReposError } = await supabase
        .from('user_repositories')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (userReposError) throw userReposError;

      setTemplates(templatesData || []);
      setUserRepos(userReposData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRepository = async (template: Repository) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !chatbotName.trim()) return;

    try {
      // Get GitHub access token from session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const githubToken = session?.provider_token;
      if (!githubToken) {
        throw new Error('GitHub access token not found');
      }

      // Create new repository name
      const newRepoName = chatbotName.toLowerCase().replace(/\s+/g, '-');
      const newRepoUrl = `https://github.com/${user?.user_metadata.user_name}/${newRepoName}`;

      // Create repository in GitHub
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRepoName,
          description: `Chatbot ${chatbotName}`,
          private: false,
          auto_init: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create GitHub repository');
      }

      // Create new repository entry in database
      const { data: newRepo, error } = await supabase
        .from('user_repositories')
        .insert({
          user_id: user?.id,
          template_repo_id: selectedTemplate.id,
          github_repo_name: newRepoName,
          github_repo_url: newRepoUrl,
          chatbot_name: chatbotName
        })
        .select()
        .single();

      if (error) throw error;

      // Create default chatbot config
      await supabase
        .from('chatbot_config')
        .insert({
          user_repo_id: newRepo.id
        });

      toast({
        title: "Berhasil",
        description: `Repository ${chatbotName} berhasil dibuat di GitHub`,
      });

      setChatbotName('');
      setIsDialogOpen(false);
      setSelectedTemplate(null);
      fetchData();
    } catch (error) {
      console.error('Error copying repository:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyalin repository",
        variant: "destructive",
      });
    }
  };

  const handleRepositoryClick = (repoId: string) => {
    navigate(`/repository/${repoId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard User</h1>
        <p className="text-gray-600 mt-2">Kelola chatbot Anda dan salin template baru</p>
      </div>

      {/* User Repositories */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Chatbot Saya</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userRepos.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Belum ada chatbot yang dibuat</p>
              </CardContent>
            </Card>
          ) : (
            userRepos.map((repo) => (
              <Card key={repo.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{repo.chatbot_name}</CardTitle>
                  <CardDescription>{repo.github_repo_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRepositoryClick(repo.id)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Kelola
                    </Button>
                    <a
                      href={repo.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Template Repositories */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Template Repository</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Belum ada template repository yang tersedia</p>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.github_repo_name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleCopyRepository(template)}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Repository
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Copy Repository Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Repository</DialogTitle>
            <DialogDescription>
              Masukkan nama untuk chatbot baru Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="chatbot_name">Nama Chatbot</Label>
              <Input
                id="chatbot_name"
                value={chatbotName}
                onChange={(e) => setChatbotName(e.target.value)}
                placeholder="chatbot-raja-ampat"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Nama ini akan digunakan sebagai nama repository GitHub
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Copy Repository</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
