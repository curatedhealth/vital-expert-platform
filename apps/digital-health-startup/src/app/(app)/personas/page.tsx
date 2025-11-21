'use client';

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vital/ui";
import { personasService } from "@/lib/services/personas/personas-service";
import { Persona } from "@/lib/db/drizzle/schema"; // Import Persona type

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoading(true);
        // Using a placeholder tenantId for now
        const fetchedPersonas = await personasService.getPersonas('a1b2c3d4-e5f6-7890-1234-567890abcdef');
        setPersonas(fetchedPersonas);
      } catch (err) {
        setError("Failed to load personas.");
        console.error("Error fetching personas:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-grow p-4 flex items-center justify-center">
        <p>Loading personas...</p>
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

  return (
    <div className="flex-grow p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Personas</h1>
        <Button asChild>
          <Link href="/personas/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Persona
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader>
              <CardTitle>{persona.name}</CardTitle>
              <CardDescription>{persona.tagline || persona.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/personas/${persona.id}`} className="text-sm text-primary hover:underline">
                View Details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}