import { describe, expect, it } from "vitest";
import { searchKnowledge, tokenize } from "@/content/knowledge";

describe("tokenize", () => {
  it("drops stopwords and punctuation", () => {
    expect(tokenize("the and of")).toEqual([]);
  });
  it("keeps dotted acronyms intact", () => {
    expect(tokenize("What is the L.I.G.T.A.S. thesis?")).toEqual(tokenize("ligtas thesis"));
    expect(searchKnowledge("What is L.I.G.T.A.S.?").entry?.id).toBe("ligtas");
  });
});

describe("searchKnowledge", () => {
  it("answers thesis questions with the LIGTAS entry", () => {
    expect(searchKnowledge("Tell me about his thesis").entry?.id).toBe("ligtas");
  });

  it("answers internship questions", () => {
    expect(searchKnowledge("Where did he do his internship?").entry?.id).toBe("internship");
  });

  it("answers contact questions", () => {
    expect(searchKnowledge("how do I email him").entry?.id).toBe("contact");
  });

  it("returns null (honest fallback) for unrelated questions", () => {
    expect(searchKnowledge("What's his favourite pizza topping?").entry).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(searchKnowledge("   ").entry).toBeNull();
  });
});
