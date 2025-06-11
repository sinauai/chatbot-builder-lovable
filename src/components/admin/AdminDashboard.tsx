
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Repository {
  id: string;
  github_repo_name: string;
  github_repo_url: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    github_repo_name: '',
    github_repo_url: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchRepositories();
    }
  }, [user]);

  const fetchRepositories = async () => {
    try {
      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .eq('admin_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRepositories(data || []);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar repository",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('repositories')
        .insert({
          admin_id: user?.id,
          github_repo_name: formData.github_repo_name,
          github_repo_url: formData.github_repo_url,
          description: formData.description
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Repository template berhasil ditambahkan",
      });

      setFormData({ github_repo_name: '', github_repo_url: '', description: '' });
      setIsDialogOpen(false);
      fetchRepositories();
    } catch (error) {
      console.error('Error adding repository:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan repository template",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('repositories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Repository template berhasil dihapus",
      });

      fetchRepositories();
    } catch (error) {
      console.error('Error deleting repository:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus repository template",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-gray-600 mt-2">Kelola repository template untuk chatbot</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Repository Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Repository Template</DialogTitle>
              <DialogDescription>
                Tambahkan repository GitHub yang akan digunakan sebagai template chatbot
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="repo_name">Nama Repository</Label>
                <Input
                  id="repo_name"
                  value={formData.github_repo_name}
                  onChange={(e) => setFormData({ ...formData, github_repo_name: e.target.value })}
                  placeholder="my-chatbot-template"
                  required
                />
              </div>
              <div>
                <Label htmlFor="repo_url">URL Repository GitHub</Label>
                <Input
                  id="repo_url"
                  value={formData.github_repo_url}
                  onChange={(e) => setFormData({ ...formData, github_repo_url: e.target.value })}
                  placeholder="https://github.com/username/my-chatbot-template"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Template chatbot untuk keperluan..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Tambah Repository</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {repositories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Belum ada repository template yang ditambahkan</p>
            </CardContent>
          </Card>
        ) : (
          repositories.map((repo) => (
            <Card key={repo.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{repo.github_repo_name}</CardTitle>
                    <CardDescription className="mt-2">{repo.description}</CardDescription>
                    <a 
                      href={repo.github_repo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2 block"
                    >
                      {repo.github_repo_url}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(repo.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
