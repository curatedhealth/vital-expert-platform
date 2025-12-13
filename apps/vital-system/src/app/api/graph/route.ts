/**
 * Graph API Route - Unified Data Service
 *
 * Fetches ontology data from Supabase and transforms it into graph format.
 * Builds relationships based on foreign key connections.
 */

import { NextRequest, NextResponse } from "next/server";
import type { GraphNode, GraphEdge, NodeType } from "../../../features/ontology-explorer/types/graph.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bomltkhixeatxuoxmolq.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

interface SupabaseFunction {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  mission_statement: string | null;
  industry: string | null;
}

interface SupabaseDepartment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  function_id: string | null;
}

interface SupabaseRole {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  function_id: string | null;
  department_id: string | null;
  seniority_level: string | null;
  role_type: string | null;
}

interface SupabaseJTBD {
  id: string;
  code: string;
  name: string;
  job_statement?: string | null;
  job_category?: string | null;
  complexity?: string | null;
}

interface SupabaseAgent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  function_id: string | null;
  department_id: string | null;
  status: string;
  expertise_level: string | null;
}

interface SupabaseValueCategory {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

interface SupabaseValueDriver {
  id: string;
  code: string;
  name: string;
  value_category_id?: string | null;
  description?: string | null;
}

interface SupabaseJtbdRole {
  jtbd_id: string | null;
  role_id: string | null;
}

interface SupabaseJtbdFunction {
  jtbd_id: string | null;
  function_id: string | null;
}

interface SupabaseJtbdDepartment {
  jtbd_id: string | null;
  department_id: string | null;
}

interface SupabaseJtbdCategoryMapping {
  jtbd_id: string | null;
  value_category_id?: string | null;
  value_driver_id?: string | null;
  pillar_id?: string | null;
}

async function fetchFromSupabase<T>(table: string, select: string, limit = 200): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=${limit}`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    cache: "no-store", // Don't cache - use fresh data
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${table}:`, await response.text());
    return [];
  }

  return response.json();
}

function createNode(
  id: string,
  type: NodeType,
  label: string,
  properties: Record<string, unknown>
): GraphNode {
  return { id, type, label, properties };
}

function createEdge(
  source: string,
  target: string,
  type: string,
  label?: string
): GraphEdge {
  return {
    id: `${source}-${type}-${target}`,
    source,
    target,
    type,
    label,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nodeTypes = searchParams.get("types")?.split(",") || [];
    const functionFilter = searchParams.get("function");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Fetch all data in parallel
    const [
      functions,
      departments,
      roles,
      jtbds,
      agents,
      valueCategories,
      valueDrivers,
      jtbdRoles,
      jtbdFunctions,
      jtbdDepartments,
      jtbdCategoryMappings,
    ] = await Promise.all([
      fetchFromSupabase<SupabaseFunction>(
        "org_functions",
        "id,name,slug,description,mission_statement,industry",
        50
      ),
      fetchFromSupabase<SupabaseDepartment>(
        "org_departments",
        "id,name,slug,description,function_id",
        limit
      ),
      fetchFromSupabase<SupabaseRole>(
        "org_roles",
        "id,name,slug,description,function_id,department_id,seniority_level,role_type",
        limit
      ),
      fetchFromSupabase<SupabaseJTBD>(
        "jtbd",
        "id,code,name,job_statement,job_category,complexity",
        limit
      ),
      fetchFromSupabase<SupabaseAgent>(
        "agents",
        "id,name,slug,description,function_id,department_id,status,expertise_level",
        limit
      ),
      fetchFromSupabase<SupabaseValueCategory>(
        "value_categories",
        "id,code,name,description"
      ),
      fetchFromSupabase<SupabaseValueDriver>(
        "value_drivers",
        "id,code,name,value_category_id,description",
        100
      ),
      fetchFromSupabase<SupabaseJtbdRole>(
        "jtbd_roles",
        "jtbd_id,role_id",
        limit
      ),
      fetchFromSupabase<SupabaseJtbdFunction>(
        "jtbd_functions",
        "jtbd_id,function_id",
        limit
      ),
      fetchFromSupabase<SupabaseJtbdDepartment>(
        "jtbd_departments",
        "jtbd_id,department_id",
        limit
      ),
      fetchFromSupabase<SupabaseJtbdCategoryMapping>(
        "jtbd_category_mappings",
        "jtbd_id,value_category_id,value_driver_id,pillar_id",
        limit
      ),
    ]);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Filter helper
    const shouldInclude = (type: NodeType) =>
      nodeTypes.length === 0 || nodeTypes.includes(type);

    // Process Functions
    if (shouldInclude("Function")) {
      functions.forEach((f) => {
        if (!functionFilter || f.id === functionFilter || f.name === functionFilter) {
          nodes.push(
            createNode(f.id, "Function", f.name, {
              slug: f.slug,
              description: f.description,
              mission: f.mission_statement,
              industry: f.industry,
            })
          );
        }
      });
    }

    // Process Departments and create HAS_DEPARTMENT edges
    if (shouldInclude("Department")) {
      departments.forEach((d) => {
        const includeByFunction =
          !functionFilter ||
          d.function_id === functionFilter ||
          functions.find((f) => f.id === d.function_id && f.name === functionFilter);

        if (includeByFunction) {
          nodes.push(
            createNode(d.id, "Department", d.name, {
              slug: d.slug,
              description: d.description,
              function_id: d.function_id,
            })
          );

          if (d.function_id && nodes.some((n) => n.id === d.function_id)) {
            edges.push(createEdge(d.function_id, d.id, "HAS_DEPARTMENT"));
          }
        }
      });
    }

    // Process Roles and create HAS_ROLE edges
    if (shouldInclude("Role")) {
      roles.forEach((r) => {
        nodes.push(
          createNode(r.id, "Role", r.name, {
            slug: r.slug,
            description: r.description,
            seniority: r.seniority_level,
            roleType: r.role_type,
            function_id: r.function_id,
            department_id: r.department_id,
          })
        );

        if (r.department_id && nodes.some((n) => n.id === r.department_id)) {
          edges.push(createEdge(r.department_id, r.id, "HAS_ROLE"));
        } else if (r.function_id && nodes.some((n) => n.id === r.function_id)) {
          edges.push(createEdge(r.function_id, r.id, "HAS_ROLE"));
        }
      });
    }

    // Process JTBDs
    if (shouldInclude("JTBD")) {
      jtbds.forEach((j) => {
        nodes.push(
          createNode(j.id, "JTBD", j.name, {
            code: j.code,
            statement: j.job_statement,
            category: j.job_category,
            complexity: j.complexity,
          })
        );
      });
    }

    // Process Agents and create ASSIGNED_TO edges
    if (shouldInclude("Agent")) {
      agents
        .filter((a) => a.status === "active")
        .forEach((a) => {
          nodes.push(
            createNode(a.id, "Agent", a.name, {
              slug: a.slug,
              description: a.description,
              status: a.status,
              expertise: a.expertise_level,
              function_id: a.function_id,
              department_id: a.department_id,
            })
          );

          if (a.function_id && nodes.some((n) => n.id === a.function_id)) {
            edges.push(createEdge(a.id, a.function_id, "ASSIGNED_TO"));
          }
          if (a.department_id && nodes.some((n) => n.id === a.department_id)) {
            edges.push(createEdge(a.id, a.department_id, "ASSIGNED_TO"));
          }
        });
    }

    // Process Value Categories
    if (shouldInclude("ValueCategory")) {
      valueCategories.forEach((vc) => {
        nodes.push(
          createNode(vc.id, "ValueCategory", vc.name, {
            code: vc.code,
            description: vc.description,
          })
        );
      });
    }

    // Process Value Drivers and create DRIVES edges
    if (shouldInclude("ValueDriver")) {
      valueDrivers.forEach((vd) => {
        nodes.push(
          createNode(vd.id, "ValueDriver", vd.name, {
            code: vd.code,
            description: vd.description,
            category_id: vd.value_category_id,
          })
        );

        if (vd.value_category_id && nodes.some((n) => n.id === vd.value_category_id)) {
          edges.push(createEdge(vd.id, vd.value_category_id, "BELONGS_TO"));
        }
      });
    }

    const nodeIdSet = new Set(nodes.map((n) => n.id));

    // JTBD -> Role relationships (PERFORMS)
    jtbdRoles.forEach((rel) => {
      if (rel.role_id && rel.jtbd_id && nodeIdSet.has(rel.role_id) && nodeIdSet.has(rel.jtbd_id)) {
        edges.push(createEdge(rel.role_id, rel.jtbd_id, "PERFORMS"));
      }
    });

    // JTBD -> Function relationships
    jtbdFunctions.forEach((rel) => {
      if (rel.jtbd_id && rel.function_id && nodeIdSet.has(rel.jtbd_id) && nodeIdSet.has(rel.function_id)) {
        edges.push(createEdge(rel.jtbd_id, rel.function_id, "BELONGS_TO"));
      }
    });

    // JTBD -> Department relationships
    jtbdDepartments.forEach((rel) => {
      if (
        rel.jtbd_id &&
        rel.department_id &&
        nodeIdSet.has(rel.jtbd_id) &&
        nodeIdSet.has(rel.department_id)
      ) {
        edges.push(createEdge(rel.jtbd_id, rel.department_id, "BELONGS_TO"));
      }
    });

    // JTBD -> Value mappings
    jtbdCategoryMappings.forEach((rel) => {
      if (rel.jtbd_id && nodeIdSet.has(rel.jtbd_id)) {
        if (rel.value_category_id && nodeIdSet.has(rel.value_category_id)) {
          edges.push(createEdge(rel.jtbd_id, rel.value_category_id, "DELIVERS_VALUE"));
        }
        if (rel.value_driver_id && nodeIdSet.has(rel.value_driver_id)) {
          edges.push(createEdge(rel.jtbd_id, rel.value_driver_id, "DELIVERS_VALUE"));
        }
        if (rel.pillar_id && nodeIdSet.has(rel.pillar_id)) {
          edges.push(createEdge(rel.jtbd_id, rel.pillar_id, "DELIVERS_VALUE"));
        }
      }
    });

    // Calculate stats
    const nodeTypeCounts: Record<string, number> = {};
    const edgeTypeCounts: Record<string, number> = {};

    nodes.forEach((n) => {
      nodeTypeCounts[n.type] = (nodeTypeCounts[n.type] || 0) + 1;
    });

    edges.forEach((e) => {
      edgeTypeCounts[e.type] = (edgeTypeCounts[e.type] || 0) + 1;
    });

    return NextResponse.json({
      nodes,
      edges,
      metadata: {
        mode: "live",
        source: "supabase",
        totalNodes: nodes.length,
        totalEdges: edges.length,
        nodeTypes: nodeTypeCounts,
        edgeTypes: edgeTypeCounts,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Graph API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch graph data", details: String(error) },
      { status: 500 }
    );
  }
}
