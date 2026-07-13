import { defineCollection, z, reference } from "astro:content";
import { fileURLToPath } from "node:url";
import { yamlGlob } from "./content/yamlLoader";
import {
  RISK_DOMAIN_SLUGS,
  RISK_SUBDOMAIN_SLUGS,
  RISK_SUBDOMAINS,
} from "./lib/riskTaxonomy";
import {
  MITIGATION_CATEGORY_SLUGS,
  MITIGATION_STATUS_SLUGS,
} from "./lib/mitigationTaxonomy";

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

// Which polity a record belongs to. Canadian records are the default; records
// from international processes (G7, OECD, UN, ...) opt in explicitly.
const jurisdictionSchema = z
  .enum(["canada", "international"])
  .default("canada");

const events = defineCollection({
  loader: yamlGlob({ pattern: "*.yaml", base: dataDir("events") }),
  schema: z.object({
    id: z.string(),
    type: z.enum([
      "CommitteeHearing",
      "GovernmentAnnouncement",
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
    jurisdiction: jurisdictionSchema,
  }),
});

export const artifactTypeSchema = z.enum([
  "GovernmentProgram",
  "JointStatement",
  "Legislation",
  "PolicyDocument",
  "Report",
  "WhitePaper",
]);
export type ArtifactType = z.infer<typeof artifactTypeSchema>;

const artifacts = defineCollection({
  loader: yamlGlob({ pattern: "*.yaml", base: dataDir("artifacts") }),
  schema: z.object({
    id: z.string(),
    type: artifactTypeSchema,
    schema_type: z.literal("CreativeWork"),
    title: z.string(),
    published_date: z.coerce.date(),
    summary: z.string().max(300).optional(),
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
    organizations: z.array(orgRoleSchema).min(1),
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
          title: z.string().optional().default(""),
          summary: z.string().optional().default(""),
          robustness: z.enum(["robust", "contingent"]).optional(),
          scenarios: z.array(z.string()).optional().default([]),
          mitigation: reference("mitigations").optional(),
        }),
      )
      .default([]),
    risk_findings: z
      .array(
        z.object({
          id: z.string(),
          category: z.enum(["misuse", "structural", "societal"]),
          title: z.string(),
          summary: z.string(),
          evidence_level: z.enum(["established", "emerging", "uncertain"]),
          risk: reference("risks").optional(),
        }),
      )
      .default([]),
    tags: z.array(z.string()).default([]),
    jurisdiction: jurisdictionSchema,
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
    country: z.enum(["ca", "uk", "international"]),
    tags: z.array(z.string()).default([]),
  }),
});

const risks = defineCollection({
  loader: yamlGlob({ pattern: "*.yaml", base: dataDir("risks") }),
  schema: z
    .object({
      id: z.string(),
      schema_type: z.literal("DefinedTerm"),
      title: z.string(),
      description: z.string().optional(),
      domain: z.enum(RISK_DOMAIN_SLUGS),
      subdomain: z.enum(RISK_SUBDOMAIN_SLUGS),
      tags: z.array(z.string()).default([]),
    })
    .superRefine((val, ctx) => {
      if (RISK_SUBDOMAINS[val.subdomain].domain !== val.domain) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["subdomain"],
          message: `subdomain "${val.subdomain}" belongs to domain "${RISK_SUBDOMAINS[val.subdomain].domain}", not "${val.domain}"`,
        });
      }
    }),
});

const mitigations = defineCollection({
  loader: yamlGlob({ pattern: "*.yaml", base: dataDir("mitigations") }),
  schema: z.object({
    id: z.string(),
    schema_type: z.literal("DefinedTerm"),
    title: z.string(),
    description: z.string().optional(),
    mitigation_type: z.enum(MITIGATION_CATEGORY_SLUGS).optional(),
    addresses_risks: z.array(reference("risks")).default([]),
    status: z.enum(MITIGATION_STATUS_SLUGS).default("untracked"),
    implemented_by: z
      .array(
        z
          .object({
            artifact: reference("artifacts").optional(),
            event: reference("events").optional(),
            relationship: z.enum([
              "implements",
              "partially_implements",
              "related",
            ]),
            note: z.string().optional(),
          })
          .superRefine((val, ctx) => {
            const refs = [val.artifact, val.event].filter(Boolean).length;
            if (refs !== 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  "each implemented_by entry needs exactly one of artifact/event",
              });
            }
          }),
      )
      .default([]),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  events,
  artifacts,
  organizations,
  risks,
  mitigations,
};
