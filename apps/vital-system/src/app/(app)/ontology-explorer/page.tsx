/**
 * Ontology Explorer Page
 *
 * Interactive Neo4j graph visualization for the VITAL Enterprise Ontology.
 * Features:
 * - Force-directed graph layout using @neo4j-nvl/react
 * - AI-powered natural language queries via chat sidebar
 * - Node type filters and search
 * - Node details drawer with relationship navigation
 */

import { Metadata } from "next";
import OntologyExplorer from "./ontology-explorer";

export const metadata: Metadata = {
  title: "Ontology Explorer | VITAL",
  description:
    "Interactive visualization of the VITAL Enterprise Ontology - explore Functions, Departments, Roles, JTBDs, and Value relationships with AI-powered navigation.",
};

export default function OntologyExplorerPage() {
  return <OntologyExplorer />;
}
