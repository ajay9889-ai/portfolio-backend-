import { Request, Response } from "express";
import { PROFILE, PROJECTS, SKILL_CATEGORIES, EXPERIENCES } from "../data/portfolioData.js";

export const getProfile = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: PROFILE
  });
};

export const getProjects = (req: Request, res: Response): void => {
  const { category, featured } = req.query;
  let filtered = [...PROJECTS];

  if (category && typeof category === "string") {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (featured === "true") {
    filtered = filtered.filter(p => p.featured);
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
};

export const getProjectBySlug = (req: Request, res: Response): void => {
  const { slug } = req.params;
  const project = PROJECTS.find(p => p.slug === slug || p.id === slug);

  if (!project) {
    res.status(404).json({
      success: false,
      error: "Project not found"
    });
    return;
  }

  res.json({
    success: true,
    data: project
  });
};

export const getSkills = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: SKILL_CATEGORIES.length,
    data: SKILL_CATEGORIES
  });
};

export const getExperience = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: EXPERIENCES.length,
    data: EXPERIENCES
  });
};

export const getStats = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      stats: PROFILE.stats,
      totalProjects: PROJECTS.length,
      featuredProjects: PROJECTS.filter(p => p.featured).length,
      skillCategories: SKILL_CATEGORIES.length
    }
  });
};
