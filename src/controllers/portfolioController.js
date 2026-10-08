"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.getExperience = exports.getSkills = exports.getProjectBySlug = exports.getProjects = exports.getProfile = void 0;
var portfolioData_js_1 = require("../data/portfolioData.js");
var getProfile = function (_req, res) {
    res.json({
        success: true,
        data: portfolioData_js_1.PROFILE
    });
};
exports.getProfile = getProfile;
var getProjects = function (req, res) {
    var _a = req.query, category = _a.category, featured = _a.featured;
    var filtered = __spreadArray([], portfolioData_js_1.PROJECTS, true);
    if (category && typeof category === "string") {
        filtered = filtered.filter(function (p) { return p.category.toLowerCase() === category.toLowerCase(); });
    }
    if (featured === "true") {
        filtered = filtered.filter(function (p) { return p.featured; });
    }
    res.json({
        success: true,
        count: filtered.length,
        data: filtered
    });
};
exports.getProjects = getProjects;
var getProjectBySlug = function (req, res) {
    var slug = req.params.slug;
    var project = portfolioData_js_1.PROJECTS.find(function (p) { return p.slug === slug || p.id === slug; });
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
exports.getProjectBySlug = getProjectBySlug;
var getSkills = function (_req, res) {
    res.json({
        success: true,
        count: portfolioData_js_1.SKILL_CATEGORIES.length,
        data: portfolioData_js_1.SKILL_CATEGORIES
    });
};
exports.getSkills = getSkills;
var getExperience = function (_req, res) {
    res.json({
        success: true,
        count: portfolioData_js_1.EXPERIENCES.length,
        data: portfolioData_js_1.EXPERIENCES
    });
};
exports.getExperience = getExperience;
var getStats = function (_req, res) {
    res.json({
        success: true,
        data: {
            stats: portfolioData_js_1.PROFILE.stats,
            totalProjects: portfolioData_js_1.PROJECTS.length,
            featuredProjects: portfolioData_js_1.PROJECTS.filter(function (p) { return p.featured; }).length,
            skillCategories: portfolioData_js_1.SKILL_CATEGORIES.length
        }
    });
};
exports.getStats = getStats;
