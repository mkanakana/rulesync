import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SKILL_FILE_NAME } from "../../constants/general.js";
import { RULESYNC_SKILLS_RELATIVE_DIR_PATH } from "../../constants/rulesync-paths.js";
import { setupTestDirectory } from "../../test-utils/test-directories.js";
import { ensureDir, writeFileContent } from "../../utils/file.js";
import { CodexCliSimulatedSkill } from "./codexcli-simulated-skill.js";
import { RulesyncSkill } from "./rulesync-skill.js";

describe("CodexCliSimulatedSkill", () => {
  let testDir: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const testSetup = await setupTestDirectory();
    testDir = testSetup.testDir;
    cleanup = testSetup.cleanup;
    vi.spyOn(process, "cwd").mockReturnValue(testDir);
  });

  afterEach(async () => {
    await cleanup();
    vi.restoreAllMocks();
  });

  describe("getSettablePaths", () => {
    it("should return .codex/skills as relativeDirPath", () => {
      const paths = CodexCliSimulatedSkill.getSettablePaths();
      expect(paths.relativeDirPath).toBe(join(".codex", "skills"));
    });

    it("should throw error when global is true", () => {
      expect(() => CodexCliSimulatedSkill.getSettablePaths({ global: true })).toThrow(
        "CodexCliSimulatedSkill does not support global mode.",
      );
    });
  });

  describe("constructor", () => {
    it("should create instance with valid content", () => {
      const skill = new CodexCliSimulatedSkill({
        baseDir: testDir,
        relativeDirPath: join(".codex", "skills"),
        dirName: "test-skill",
        frontmatter: {
          name: "Test Skill",
          description: "Test skill description",
        },
        body: "This is the body of the codex cli simulated skill.",
        validate: true,
      });

      expect(skill).toBeInstanceOf(CodexCliSimulatedSkill);
      expect(skill.getBody()).toBe("This is the body of the codex cli simulated skill.");
      expect(skill.getFrontmatter()).toEqual({
        name: "Test Skill",
        description: "Test skill description",
      });
    });
  });

  describe("fromDir", () => {
    it("should create instance from valid skill directory", async () => {
      const skillDir = join(testDir, ".codex", "skills", "test-skill");
      await ensureDir(skillDir);
      const skillContent = `---
name: Test Skill
description: Test skill description
---

This is the body of the codex cli simulated skill.`;
      await writeFileContent(join(skillDir, SKILL_FILE_NAME), skillContent);

      const skill = await CodexCliSimulatedSkill.fromDir({
        baseDir: testDir,
        dirName: "test-skill",
      });

      expect(skill).toBeInstanceOf(CodexCliSimulatedSkill);
      expect(skill.getBody()).toBe("This is the body of the codex cli simulated skill.");
      expect(skill.getFrontmatter()).toEqual({
        name: "Test Skill",
        description: "Test skill description",
      });
    });

    it("should throw error when SKILL.md not found", async () => {
      const skillDir = join(testDir, ".codex", "skills", "empty-skill");
      await ensureDir(skillDir);

      await expect(
        CodexCliSimulatedSkill.fromDir({
          baseDir: testDir,
          dirName: "empty-skill",
        }),
      ).rejects.toThrow(/SKILL\.md not found/);
    });
  });

  describe("fromRulesyncSkill", () => {
    it("should create instance from RulesyncSkill", () => {
      const rulesyncSkill = new RulesyncSkill({
        baseDir: testDir,
        relativeDirPath: RULESYNC_SKILLS_RELATIVE_DIR_PATH,
        dirName: "test-skill",
        frontmatter: {
          name: "Test Skill",
          description: "Test skill description",
        },
        body: "Test body content",
        validate: true,
      });

      const codexCliSimulatedSkill = CodexCliSimulatedSkill.fromRulesyncSkill({
        rulesyncSkill,
        validate: true,
      });

      expect(codexCliSimulatedSkill).toBeInstanceOf(CodexCliSimulatedSkill);
      expect(codexCliSimulatedSkill.getBody()).toBe("Test body content");
      expect(codexCliSimulatedSkill.getFrontmatter()).toEqual({
        name: "Test Skill",
        description: "Test skill description",
      });
    });
  });

  describe("isTargetedByRulesyncSkill", () => {
    it("should return true when targets includes '*'", () => {
      const rulesyncSkill = new RulesyncSkill({
        baseDir: testDir,
        relativeDirPath: RULESYNC_SKILLS_RELATIVE_DIR_PATH,
        dirName: "all-targets-skill",
        frontmatter: {
          name: "All Targets Skill",
          description: "Skill for all targets",
          targets: ["*"],
        },
        body: "Test body",
        validate: true,
      });

      expect(CodexCliSimulatedSkill.isTargetedByRulesyncSkill(rulesyncSkill)).toBe(true);
    });

    it("should return true when targets includes 'codexcli'", () => {
      const rulesyncSkill = new RulesyncSkill({
        baseDir: testDir,
        relativeDirPath: RULESYNC_SKILLS_RELATIVE_DIR_PATH,
        dirName: "codexcli-skill",
        frontmatter: {
          name: "Codex CLI Skill",
          description: "Skill for codex cli",
          targets: ["codexcli", "cursor"],
        },
        body: "Test body",
        validate: true,
      });

      expect(CodexCliSimulatedSkill.isTargetedByRulesyncSkill(rulesyncSkill)).toBe(true);
    });

    it("should return false when targets does not include 'codexcli'", () => {
      const rulesyncSkill = new RulesyncSkill({
        baseDir: testDir,
        relativeDirPath: RULESYNC_SKILLS_RELATIVE_DIR_PATH,
        dirName: "claudecode-only-skill",
        frontmatter: {
          name: "ClaudeCode Only Skill",
          description: "Skill for claudecode only",
          targets: ["claudecode"],
        },
        body: "Test body",
        validate: true,
      });

      expect(CodexCliSimulatedSkill.isTargetedByRulesyncSkill(rulesyncSkill)).toBe(false);
    });
  });

  describe("toRulesyncSkill", () => {
    it("should throw error because CodexCliSimulatedSkill is simulated", () => {
      const skill = new CodexCliSimulatedSkill({
        baseDir: testDir,
        relativeDirPath: join(".codex", "skills"),
        dirName: "test-skill",
        frontmatter: {
          name: "Test Skill",
          description: "Test description",
        },
        body: "Test body",
        validate: true,
      });

      expect(() => skill.toRulesyncSkill()).toThrow(
        "Not implemented because it is a SIMULATED skill.",
      );
    });
  });
});
