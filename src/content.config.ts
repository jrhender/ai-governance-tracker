import { defineCollection, z, reference } from "astro:content";
import { fileURLToPath } from "node:url";
import { yamlGlob } from "./content/yamlLoader";

const dataDir = (sub: string) =>
  fileURLToPath(new URL(`../data/${sub}`, import.meta.url));

const linkSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  icon: z.string().optional(),
});

const orgRoleSchema = z.object({
  id: reference("organizations"),
  role: z.string(),
});

const events = defineCollection({
  loader: yamlGlob({ pattern: "*.yaml", base: dataDir("events") }),
  schema: z.object({
    id: z.string(),
    type: z.enum([
      "CommitteeHearing",
      "LegislativeAction",
      "PoliticalEvent",
      "Publication",
      "Workshop",
    ]),
    schema_type: z.literal("Event"),
    title: z.string(),
    date: z.coerce.date(),
    location: z
      .object({
        name: z.string(),
        schema_type: z.string().optional(),
      })
      .optional(),
    status: z.enum(["upcoming", "completed", "cancelled"]).optional(),
    description: z.string().optional(),
    organizations: z.array(orgRoleSchema).default([]),
    tags: z.array(z.string()).default([]),
    links: z.array(linkSchema).default([]),
    related_artifacts: z
      .array(z.object({ id: reference("artifacts") }))
      .default([]),
  }),
});

const artifacts = defineCollection({
  loader: yamlGlob({ pattern: "*.yaml", base: dataDir("artifacts") }),
  schema: z.object({
    id: z.string(),
    type: z.string(),
    schema_type: z.literal("CreativeWork"),
    title: z.string(),
    published_date: z.coerce.date(),
    description: z.string().optional(),
    lifecycle_status: z
      .enum(["active", "enacted", "died", "withdrawn"])
      .optional(),
    current_stage: z.string().optional(),
    stages: z
      .array(
        z.object({
          date: z.coerce.date(),
          stage: z.string(),
          note: z.string().optional(),
          links: z.array(linkSchema).default([]),
        }),
      )
      .default([]),
    provisions: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          summary: z.string(),
        }),
      )
      .default([]),
    organizations: z.array(orgRoleSchema).default([]),
    derives_from: z
      .array(
        z.object({
          id: reference("events"),
          relationship: z.string(),
        }),
      )
      .default([]),
    links: z.array(linkSchema).default([]),
    policy_recommendations: z
      .array(
        z.object({
          id: z.string(),
          summary: z.string().optional().default(""),
          status: z.enum([
            "untracked",
            "under_review",
            "adopted",
            "rejected",
          ]),
        }),
      )
      .default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const organizations = defineCollection({
  loader: yamlGlob({ pattern: "*.yaml", base: dataDir("organizations") }),
  schema: z.object({
    id: z.string(),
    type: z.string(),
    schema_type: z.enum(["Organization", "GovernmentOrganization"]),
    name: z.string(),
    short_name: z.string().optional(),
    url: z.string().url().optional(),
    wikipedia: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { events, artifacts, organizations };
