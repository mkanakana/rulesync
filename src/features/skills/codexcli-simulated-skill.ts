import { join } from "node:path";
import { RulesyncSkill } from "./rulesync-skill.js";
import { SimulatedSkill, SimulatedSkillParams } from "./simulated-skill.js";
import {
  ToolSkillFromDirParams,
  ToolSkillFromRulesyncSkillParams,
  ToolSkillSettablePaths,
} from "./tool-skill.js";

/**
 * Represents a simulated skill for Codex CLI (project mode only).
 * Since Codex CLI's native skill support is only available in global mode,
 * this provides a simulated skill format at .codex/skills/ for project mode.
 */
export class CodexCliSimulatedSkill extends SimulatedSkill {
  static getSettablePaths(options?: { global?: boolean }): ToolSkillSettablePaths {
    if (options?.global) {
      throw new Error("CodexCliSimulatedSkill does not support global mode.");
    }
    return {
      relativeDirPath: join(".codex", "skills"),
    };
  }

  static async fromDir(params: ToolSkillFromDirParams): Promise<CodexCliSimulatedSkill> {
    const baseParams = await this.fromDirDefault(params);
    return new CodexCliSimulatedSkill(baseParams);
  }

  static fromRulesyncSkill(params: ToolSkillFromRulesyncSkillParams): CodexCliSimulatedSkill {
    const baseParams: SimulatedSkillParams = {
      ...this.fromRulesyncSkillDefault(params),
      relativeDirPath: this.getSettablePaths().relativeDirPath,
    };
    return new CodexCliSimulatedSkill(baseParams);
  }

  static isTargetedByRulesyncSkill(rulesyncSkill: RulesyncSkill): boolean {
    return this.isTargetedByRulesyncSkillDefault({
      rulesyncSkill,
      toolTarget: "codexcli",
    });
  }
}
