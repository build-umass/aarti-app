'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, Edit, X, Filter, Trash2, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Resource } from '../../../../types';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:3002';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [resourceToSave, setResourceToSave] = useState<any>(null);
  const [resourceToPublish, setResourceToPublish] = useState<Resource | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      topic: '',
      title: '',
      content: '',
    }
  });

  // Fetch resources from backend when component mounts
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/resource`);
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resources from the server',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Get unique topics from existing resources
  const existingTopics = Array.from(new Set(resources.map(resource => resource.topic)));

  // Filter resources by selected topic
  const filteredResources = selectedTopic === 'all' 
    ? resources 
    : resources.filter(resource => resource.topic === selectedTopic);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Error',
          description: 'Please select a PDF file',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    const formData = form.getValues();
    if (!formData.topic || !formData.title) {
      toast({
        title: 'Error',
        description: 'Please fill in topic and title',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('pdf', selectedFile);
      uploadFormData.append('topic', formData.topic);
      uploadFormData.append('title', formData.title);

      const response = await fetch(`${API_BASE_URL}/resource/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const newResource = await response.json();
      
      // Update form with extracted content
      form.setValue('content', newResource.content);
      
      // Refresh resources list
      const resourcesResponse = await fetch(`${API_BASE_URL}/resource`);
      if (resourcesResponse.ok) {
        const resourcesData = await resourcesResponse.json();
        setResources(resourcesData);
      }

      toast({
        title: 'Success',
        description: 'PDF uploaded and text extracted successfully',
      });
      
      setSelectedFile(null);
      setEditingResource(newResource);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload PDF',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    form.reset({
      topic: resource.topic,
      title: resource.title,
      content: resource.content,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (resource: Resource) => {
    setResourceToDelete(resource);
    setIsDeleteDialogOpen(true);
  };

  const handlePublishClick = (resource: Resource) => {
    setResourceToPublish(resource);
    setIsPublishDialogOpen(true);
  };

  const resetForm = () => {
    setEditingResource(null);
    setSelectedFile(null);
    form.reset({
      topic: '',
      title: '',
      content: '',
    });
  };

  const handleSaveClick = (data: any) => {
    const resourceData = {
      id: editingResource ? editingResource.id : resources.length > 0 ? Math.max(...resources.map(r => r.id)) + 1 : 1,
      topic: data.topic,
      title: data.title,
      content: data.content,
      isPublished: editingResource ? editingResource.isPublished : false,
    };
    
    setResourceToSave(resourceData);
    setIsSaveDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    handleSaveClick(data);
  };

  const saveResource = async () => {
    if (!resourceToSave) return;

    try {
      if (editingResource) {
        // Update existing resource
        const response = await fetch(`${API_BASE_URL}/resource/${editingResource.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resourceToSave),
        });

        if (!response.ok) {
          throw new Error('Failed to update resource');
        }

        const updatedResource = await response.json();
        setResources(resources.map(r => r.id === editingResource.id ? updatedResource : r));
        toast({
          title: 'Success',
          description: 'Resource updated successfully',
        });
      } else {
        // Create new resource
        const response = await fetch(`${API_BASE_URL}/resource`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resourceToSave),
        });

        if (!response.ok) {
          throw new Error('Failed to create resource');
        }

        const newResource = await response.json();
        setResources([...resources, newResource]);
        toast({
          title: 'Success',
          description: 'Resource created successfully',
        });
      }

      setIsSaveDialogOpen(false);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to save resource',
        variant: 'destructive',
      });
    }
  };

  const deleteResource = async () => {
    if (!resourceToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/resource/${resourceToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }

      setResources(resources.filter(r => r.id !== resourceToDelete.id));
      toast({
        title: 'Success',
        description: 'Resource deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive',
      });
    }
  };

  const publishResource = async () => {
    if (!resourceToPublish) return;

    try {
      const response = await fetch(`${API_BASE_URL}/resource/${resourceToPublish.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to publish resource');
      }

      const result = await response.json();
      
      // Update resource to mark as published
      setResources(resources.map(r => 
        r.id === resourceToPublish.id 
          ? { ...r, isPublished: true } 
          : r
      ));

      toast({
        title: 'Success',
        description: 'Resource published to quizzes successfully',
      });
      setIsPublishDialogOpen(false);
      setResourceToPublish(null);
    } catch (error) {
      console.error('Error publishing resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish resource',
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
        <h1 className="text-3xl font-bold">Resources</h1>
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
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
              <DialogDescription>
                Upload a PDF file or manually enter resource content
              </DialogDescription>
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
                        <Input placeholder="Resource title" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Upload PDF</FormLabel>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleUpload} 
                      disabled={!selectedFile || uploading || !form.getValues().topic || !form.getValues().title}
                    >
                      {uploading ? 'Uploading...' : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter resource content or upload a PDF to extract text"
                          className="min-h-[300px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        You can edit the extracted text from PDF or enter content manually
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {editingResource ? 'Save Changes' : 'Create Resource'}
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
        <div className="text-center py-10">Loading resources...</div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-10">
          {selectedTopic === 'all' 
            ? 'No resources found. Create your first resource!'
            : `No resources found for topic "${selectedTopic}"`}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{resource.title}</CardTitle>
                  {resource.isPublished && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Topic: {resource.topic}</p>
                <div className="mt-4">
                  <details className="text-sm">
                    <summary className="font-medium cursor-pointer">View Content</summary>
                    <div className="mt-2">
                      <div className="p-2 bg-secondary rounded-md max-h-[200px] overflow-y-auto">
                        <p className="whitespace-pre-wrap text-xs">{resource.content.substring(0, 500)}{resource.content.length > 500 ? '...' : ''}</p>
                      </div>
                    </div>
                  </details>
                </div>
                {resource.isPublished && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Published to quizzes
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEdit(resource)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {!resource.isPublished && (
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handlePublishClick(resource)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDeleteClick(resource)}
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
              Are you sure you want to delete the resource "{resourceToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={deleteResource}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setResourceToDelete(null);
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
              Are you sure you want to {editingResource ? 'save changes to' : 'create'} the resource "{resourceToSave?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-start">
            <Button
              type="button"
              variant="default"
              onClick={saveResource}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSaveDialogOpen(false);
                setResourceToSave(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish to Quizzes</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish the resource "{resourceToPublish?.title}" to the quizzes section? This will create a quiz item from this resource.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-start">
            <Button
              type="button"
              variant="default"
              onClick={publishResource}
            >
              <FileText className="h-4 w-4 mr-2" />
              Publish
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPublishDialogOpen(false);
                setResourceToPublish(null);
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
