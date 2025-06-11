
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Save, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatbotConfig {
  id: string;
  title: string;
  subtitle: string;
}

interface NewsItem {
  id: string;
  url: string;
  published_at: string;
  title: string;
  full_text: string;
}

interface Question {
  id: string;
  question: string;
}

export function RepositoryDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [titleForm, setTitleForm] = useState({ title: '', subtitle: '' });
  const [newsForm, setNewsForm] = useState({ url: '', published_at: '', title: '', full_text: '' });
  const [questionForm, setQuestionForm] = useState({ question: '' });
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [dialogStates, setDialogStates] = useState({
    news: false,
    question: false
  });

  useEffect(() => {
    if (id && user) {
      fetchRepositoryData();
    }
  }, [id, user]);

  const fetchRepositoryData = async () => {
    try {
      // Fetch chatbot config
      const { data: configData, error: configError } = await supabase
        .from('chatbot_config')
        .select('*')
        .eq('user_repo_id', id)
        .single();

      if (configError && configError.code !== 'PGRST116') throw configError;

      // Fetch news
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .eq('user_repo_id', id)
        .order('created_at', { ascending: false });

      if (newsError) throw newsError;

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('user_repo_id', id)
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;

      setConfig(configData);
      setNews(newsData || []);
      setQuestions(questionsData || []);

      if (configData) {
        setTitleForm({
          title: configData.title || 'Halo, Sahabat Kompas',
          subtitle: configData.subtitle || 'Silakan ajukan pertanyaan terkait artikel yang Anda baca. Jawaban dibuat berdasarkan berita di Kompas.id.'
        });
      }
    } catch (error) {
      console.error('Error fetching repository data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data repository",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      if (config) {
        await supabase
          .from('chatbot_config')
          .update({
            title: titleForm.title,
            subtitle: titleForm.subtitle
          })
          .eq('id', config.id);
      } else {
        await supabase
          .from('chatbot_config')
          .insert({
            user_repo_id: id,
            title: titleForm.title,
            subtitle: titleForm.subtitle
          });
      }

      toast({
        title: "Berhasil",
        description: "Konfigurasi title dan subtitle berhasil disimpan",
      });

      fetchRepositoryData();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan konfigurasi",
        variant: "destructive",
      });
    }
  };

  const saveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await supabase
          .from('news')
          .update(newsForm)
          .eq('id', editingNews.id);
      } else {
        await supabase
          .from('news')
          .insert({
            ...newsForm,
            user_repo_id: id
          });
      }

      toast({
        title: "Berhasil",
        description: editingNews ? "Berita berhasil diupdate" : "Berita berhasil ditambahkan",
      });

      setNewsForm({ url: '', published_at: '', title: '', full_text: '' });
      setEditingNews(null);
      setDialogStates({ ...dialogStates, news: false });
      fetchRepositoryData();
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan berita",
        variant: "destructive",
      });
    }
  };

  const saveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await supabase
          .from('questions')
          .update({ question: questionForm.question })
          .eq('id', editingQuestion.id);
      } else {
        await supabase
          .from('questions')
          .insert({
            question: questionForm.question,
            user_repo_id: id
          });
      }

      toast({
        title: "Berhasil",
        description: editingQuestion ? "Pertanyaan berhasil diupdate" : "Pertanyaan berhasil ditambahkan",
      });

      setQuestionForm({ question: '' });
      setEditingQuestion(null);
      setDialogStates({ ...dialogStates, question: false });
      fetchRepositoryData();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pertanyaan",
        variant: "destructive",
      });
    }
  };

  const deleteNews = async (newsId: string) => {
    try {
      await supabase.from('news').delete().eq('id', newsId);
      toast({
        title: "Berhasil",
        description: "Berita berhasil dihapus",
      });
      fetchRepositoryData();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus berita",
        variant: "destructive",
      });
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      await supabase.from('questions').delete().eq('id', questionId);
      toast({
        title: "Berhasil",
        description: "Pertanyaan berhasil dihapus",
      });
      fetchRepositoryData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus pertanyaan",
        variant: "destructive",
      });
    }
  };

  const handleEditNews = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setNewsForm({
      url: newsItem.url,
      published_at: newsItem.published_at,
      title: newsItem.title,
      full_text: newsItem.full_text
    });
    setDialogStates({ ...dialogStates, news: true });
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({ question: question.question });
    setDialogStates({ ...dialogStates, question: true });
  };

  const handleDeploy = () => {
    window.open('https://vercel.com/login', '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold">Detail Repository</h1>
        </div>
        <Button onClick={handleDeploy} className="bg-black hover:bg-gray-800">
          <ExternalLink className="w-4 h-4 mr-2" />
          Deploy
        </Button>
      </div>

      {/* Title & Subtitle Configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Konfigurasi Title dan Subtitle</CardTitle>
          <CardDescription>
            Atur title dan subtitle yang akan ditampilkan di chatbot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={titleForm.title}
              onChange={(e) => setTitleForm({ ...titleForm, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={titleForm.subtitle}
              onChange={(e) => setTitleForm({ ...titleForm, subtitle: e.target.value })}
              rows={3}
            />
          </div>
          <Button onClick={saveConfig}>
            <Save className="w-4 h-4 mr-2" />
            Simpan Konfigurasi
          </Button>
        </CardContent>
      </Card>

      {/* News Table */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Knowledge Base (News)</CardTitle>
              <CardDescription>
                Kelola berita yang akan menjadi basis pengetahuan chatbot.
                <br />
                <span className="text-orange-600">* Kolom published_at harus diisi dengan format dd/mm/yyyy</span>
              </CardDescription>
            </div>
            <Dialog open={dialogStates.news} onOpenChange={(open) => {
              setDialogStates({ ...dialogStates, news: open });
              if (!open) {
                setEditingNews(null);
                setNewsForm({ url: '', published_at: '', title: '', full_text: '' });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Berita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingNews ? 'Edit Berita' : 'Tambah Berita'}</DialogTitle>
                  <DialogDescription>
                    Masukkan data berita untuk knowledge base chatbot
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={saveNews} className="space-y-4">
                  <div>
                    <Label htmlFor="news_url">URL</Label>
                    <Input
                      id="news_url"
                      value={newsForm.url}
                      onChange={(e) => setNewsForm({ ...newsForm, url: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="published_at">Published At (dd/mm/yyyy)</Label>
                    <Input
                      id="published_at"
                      value={newsForm.published_at}
                      onChange={(e) => setNewsForm({ ...newsForm, published_at: e.target.value })}
                      placeholder="01/01/2024"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="news_title">Title</Label>
                    <Input
                      id="news_title"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_text">Full Text</Label>
                    <Textarea
                      id="full_text"
                      value={newsForm.full_text}
                      onChange={(e) => setNewsForm({ ...newsForm, full_text: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogStates({ ...dialogStates, news: false })}>
                      Batal
                    </Button>
                    <Button type="submit">
                      {editingNews ? 'Update' : 'Tambah'} Berita
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Published At</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    Belum ada berita yang ditambahkan
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs truncate">{item.url}</TableCell>
                    <TableCell>{item.published_at}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNews(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteNews(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Contoh Pertanyaan (Questions)</CardTitle>
              <CardDescription>
                Kelola pertanyaan contoh yang akan ditampilkan di halaman depan chatbot
              </CardDescription>
            </div>
            <Dialog open={dialogStates.question} onOpenChange={(open) => {
              setDialogStates({ ...dialogStates, question: open });
              if (!open) {
                setEditingQuestion(null);
                setQuestionForm({ question: '' });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Pertanyaan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}</DialogTitle>
                  <DialogDescription>
                    Masukkan pertanyaan contoh untuk chatbot
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={saveQuestion} className="space-y-4">
                  <div>
                    <Label htmlFor="question">Pertanyaan</Label>
                    <Textarea
                      id="question"
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm({ question: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogStates({ ...dialogStates, question: false })}>
                      Batal
                    </Button>
                    <Button type="submit">
                      {editingQuestion ? 'Update' : 'Tambah'} Pertanyaan
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pertanyaan</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500">
                    Belum ada pertanyaan yang ditambahkan
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.question}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuestion(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteQuestion(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
