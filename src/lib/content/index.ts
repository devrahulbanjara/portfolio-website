/**
 * Portfolio content, edited in code and deployed.
 *
 * Import from here rather than reaching into individual modules, so the surface
 * stays one import site if the shape ever changes.
 *
 * Blog content does NOT live here - it comes from Hashnode via src/lib/blog.
 */
export { profile } from "./profile";
export { experience } from "./experience";
export { coreStack } from "./skills";
export {
  projects,
  flagshipProjects,
  archiveProjects,
  caseStudyProjects,
} from "./projects";
export { certifications, education, activities } from "./credentials";
export type * from "./types";
