'use client';

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vital/ui";
import { personasService } from "@/lib/services/personas/personas-service";
import { Persona } from "@/lib/db/drizzle/schema"; // Import Persona type

export default function PersonaDetailPage({ params }: { params: { personaId: string } }) {
  const { personaId } = params;
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersona = async () => {
      try {
        setIsLoading(true);
        const fetchedPersona = await personasService.getPersona('a1b2c3d4-e5f6-7890-1234-567890abcdef', personaId); // Placeholder tenantId
        if (fetchedPersona) {
          setPersona(fetchedPersona);
        } else {
          setError("Persona not found.");
        }
      } catch (err) {
        setError("Failed to load persona details.");
        console.error("Error fetching persona:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersona();
  }, [personaId]);

  if (isLoading) {
    return (
      <div className="flex-grow p-4 flex items-center justify-center">
        <p>Loading persona details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow p-4 flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="flex-grow p-4 flex items-center justify-center">
        <p>Persona details could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow p-4">
      <div className="mb-4 flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/personas">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Personas
          </Link>
        </Button>
        <h1 className="ml-4 text-2xl font-bold">Persona: {persona.name}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>{persona.tagline}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2"><strong>Role:</strong> {persona.title}</p>
            {persona.backgroundStory && <p className="mb-2">{persona.backgroundStory}</p>}
            {persona.oneLiner && <p className="italic text-muted-foreground">"{persona.oneLiner}"</p>}
          </CardContent>
        </Card>

        {persona.goals && persona.goals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {persona.goals.map((goal: any, index: number) => (
                  <li key={index}>{goal.text || goal.goal_text || JSON.stringify(goal)}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {persona.painPoints && persona.painPoints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pain Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {persona.painPoints.map((pp: any, index: number) => (
                  <li key={index}>{pp.text || pp.pain_point_text || JSON.stringify(pp)}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {persona.challenges && persona.challenges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {persona.challenges.map((challenge: any, index: number) => (
                  <li key={index}>{challenge.text || challenge.challenge_text || JSON.stringify(challenge)}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {persona.preferredTools && persona.preferredTools.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preferred Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {persona.preferredTools.map((tool: string, index: number) => (
                  <li key={index}>{tool}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {persona.aDayInTheLife && (
          <Card className="lg:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle>A Day in the Life</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{persona.aDayInTheLife}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}