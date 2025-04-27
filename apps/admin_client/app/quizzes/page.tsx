'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Save, Edit, X, Filter, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { QuizItem } from '../../../../types';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:3002';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizItem | null>(null);
  const [quizToSave, setQuizToSave] = useState<any>(null);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [editingQuiz, setEditingQuiz] = useState<QuizItem | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  const form = useForm({
    defaultValues: {
      topic: '',
      title: '',
      question: '',
      correctAnswer: '',
      feedback: '',
    }
  });

  // Fetch quiz data from backend when component mounts
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/quiz`);
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load quizzes from the server',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Get unique topics from existing quizzes
  const existingTopics = Array.from(new Set(quizzes.map(quiz => quiz.topic)));

  // Filter quizzes by selected topic
  const filteredQuizzes = selectedTopic === 'all' 
    ? quizzes 
    : quizzes.filter(quiz => quiz.topic === selectedTopic);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleEdit = (quiz: QuizItem) => {
    setEditingQuiz(quiz);
    setOptions(quiz.options);
    form.reset({
      topic: quiz.topic,
      title: quiz.title,
      question: quiz.question,
      correctAnswer: quiz.correctAnswer,
      feedback: quiz.feedback,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (quiz: QuizItem) => {
    setQuizToDelete(quiz);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setEditingQuiz(null);
    setOptions(['', '', '', '']);
    form.reset({
      topic: '',
      title: '',
      question: '',
      correctAnswer: '',
      feedback: '',
    });
  };

  const handleSaveClick = (data: any) => {
    const quizData = {
      id: editingQuiz ? editingQuiz.id : quizzes.length > 0 ? Math.max(...quizzes.map(q => q.id)) + 1 : 1,
      topic: data.topic,
      title: data.title,
      question: data.question,
      options: options.filter(opt => opt.trim() !== ''),
      correctAnswer: data.correctAnswer,
      feedback: data.feedback
    };
    
    setQuizToSave(quizData);
    setIsSaveDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    handleSaveClick(data);
  };

  const saveQuiz = async () => {
    if (!quizToSave) return;

    try {
      if (editingQuiz) {
        // Update existing quiz
        const response = await fetch(`${API_BASE_URL}/quiz/${editingQuiz.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizToSave),
        });

        if (!response.ok) {
          throw new Error('Failed to update quiz');
        }

        const updatedQuiz = await response.json();
        setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? updatedQuiz : q));
        toast({
          title: 'Success',
          description: 'Quiz updated successfully',
        });
      } else {
        // Create new quiz
        const response = await fetch(`${API_BASE_URL}/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizToSave),
        });

        if (!response.ok) {
          throw new Error('Failed to create quiz');
        }

        const newQuiz = await response.json();
        setQuizzes([...quizzes, newQuiz]);
        toast({
          title: 'Success',
          description: 'Quiz created successfully',
        });
      }

      setIsSaveDialogOpen(false);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quiz',
        variant: 'destructive',
      });
    }
  };

  const deleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/quiz/${quizToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id));
      toast({
        title: 'Success',
        description: 'Quiz deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quiz',
        variant: 'destructive',
      });
    }
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !existingTopics.includes(newTopic.trim())) {
      form.setValue('topic', newTopic.trim());
      setNewTopic('');
      setIsAddingTopic(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      {isAddingTopic ? (
                        <div className="flex gap-2">
                          <Input
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="Enter new topic"
                          />
                          <Button type="button" onClick={handleAddTopic}>Add</Button>
                          <Button type="button" variant="outline" onClick={() => setIsAddingTopic(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a topic" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {existingTopics.map(topic => (
                                <SelectItem key={topic} value={topic}>
                                  {topic}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" onClick={() => setIsAddingTopic(true)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Quiz title" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your question" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Options</FormLabel>
                    <Button type="button" onClick={addOption} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                  </div>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.map((option, index) => (
                            option.trim() && (
                              <SelectItem key={index} value={option}>
                                Option {index + 1}: {option}
                              </SelectItem>
                            )
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the correct answer from the options above
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback for Correct Answer</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide encouraging feedback for correct answers"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuiz ? 'Save Changes' : 'Create Quiz'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filter by Topic:</span>
        </div>
        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {existingTopics.map(topic => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading quizzes...</div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-10">
          {selectedTopic === 'all' 
            ? 'No quizzes found. Create your first quiz!'
            : `No quizzes found for topic "${selectedTopic}"`}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Topic: {quiz.topic}</p>
                <p className="font-medium mb-2">{quiz.question}</p>
                <div className="space-y-2">
                  {quiz.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md ${
                        option === quiz.correctAnswer
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-secondary'
                      }`}
                    >
                      Option {index + 1}: {option}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <details className="text-sm">
                    <summary className="font-medium cursor-pointer">View Feedback</summary>
                    <div className="mt-2">
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <p>{quiz.feedback}</p>
                      </div>
                    </div>
                  </details>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEdit(quiz)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDeleteClick(quiz)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the quiz "{quizToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={deleteQuiz}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setQuizToDelete(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Save</DialogTitle>
            <DialogDescription>
              Are you sure you want to {editingQuiz ? 'save changes to' : 'create'} the quiz "{quizToSave?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-start">
            <Button
              type="button"
              variant="default"
              onClick={saveQuiz}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSaveDialogOpen(false);
                setQuizToSave(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}