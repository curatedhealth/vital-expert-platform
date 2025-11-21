'use client';

import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea } from "@vital/ui";
import { personasService } from "@/lib/services/personas/personas-service";
import { InsertPersona } from "@/lib/db/drizzle/schema"; // Import InsertPersona type

export default function CreatePersonaPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [backgroundStory, setBackgroundStory] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [goals, setGoals] = useState(''); // Comma-separated string
  const [painPoints, setPainPoints] = useState(''); // Comma-separated string
  const [challenges, setChallenges] = useState(''); // Comma-separated string
  const [preferredTools, setPreferredTools] = useState(''); // Comma-separated string
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Parse comma-separated strings into arrays or JSONB objects as per schema
      const newPersona: InsertPersona = {
        tenantId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Placeholder tenantId
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        title: title,
        tagline: tagline,
        backgroundStory: backgroundStory,
        oneLiner: oneLiner,
        goals: goals.split(',').filter(s => s.trim() !== '').map(s => ({ text: s.trim() })),
        painPoints: painPoints.split(',').filter(s => s.trim() !== '').map(s => ({ text: s.trim() })),
        challenges: challenges.split(',').filter(s => s.trim() !== '').map(s => ({ text: s.trim() })),
        preferredTools: preferredTools.split(',').filter(s => s.trim() !== ''),
        // Set defaults for other non-nullable fields
        isActive: true,
        validationStatus: 'draft',
        metadata: {},
        keyResponsibilities: [], // Assuming an empty array by default
        tags: [], // Assuming an empty array by default
      };

      await personasService.createPersona('a1b2c3d4-e5f6-7890-1234-567890abcdef', newPersona); // Placeholder tenantId
      router.push('/personas'); // Redirect to personas list
    } catch (err) {
      setError("Failed to create persona. Please try again.");
      console.error("Error creating persona:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-grow p-4">
      <div className="mb-4 flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/personas">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Personas
          </Link>
        </Button>
        <h1 className="ml-4 text-2xl font-bold">Create New Persona</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Persona Details</CardTitle>
          <CardDescription>Enter the information for your new persona.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Persona Name</Label>
              <Input id="name" placeholder="e.g., Innovator Irene" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g., Head of Digital Transformation" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea id="tagline" placeholder="A brief, catchy phrase summarizing the persona." value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="oneLiner">One-Liner</Label>
              <Textarea id="oneLiner" placeholder="A concise, single-sentence description of the persona." value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="backgroundStory">Background Story</Label>
              <Textarea id="backgroundStory" placeholder="A detailed description of the persona's background, personality, and context." rows={5} value={backgroundStory} onChange={(e) => setBackgroundStory(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goals">Goals (comma-separated)</Label>
              <Input id="goals" placeholder="e.g., Discover solutions, Increase efficiency" value={goals} onChange={(e) => setGoals(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="painPoints">Pain Points (comma-separated)</Label>
              <Input id="painPoints" placeholder="e.g., Outdated technology, Slow processes" value={painPoints} onChange={(e) => setPainPoints(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="challenges">Challenges (comma-separated)</Label>
              <Input id="challenges" placeholder="e.g., Securing executive buy-in, Integrating data" value={challenges} onChange={(e) => setChallenges(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preferredTools">Preferred Tools (comma-separated)</Label>
              <Input id="preferredTools" placeholder="e.g., Jira, Miro, Tableau" value={preferredTools} onChange={(e) => setPreferredTools(e.target.value)} />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="mt-4" disabled={isSaving}>
              {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Persona</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}