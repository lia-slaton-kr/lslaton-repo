/* ============================================================
   Shared glossary data — used by the glossary page AND the
   inline term popovers on every layer.
   Copy is VERBATIM from the approved brief. `analogy` is null
   when the term has no separate analogy line.
   ============================================================ */
window.GLOSSARY = [
  {
    id: "ai",
    term: "AI",
    definition: "The broad underlying capability that powers tools like Claude and ChatGPT. Not a product itself — more like electricity that powers products.",
    analogy: null
  },
  {
    id: "platform",
    term: "Platform",
    definition: "The product you actually use. Claude.ai, ChatGPT, and Copilot are all platforms. The interface you log into.",
    analogy: null
  },
  {
    id: "model",
    term: "Model",
    definition: "The engine running inside a platform. What's actually doing the thinking. Claude Sonnet, GPT-4o, and Gemini Pro are all models.",
    analogy: null
  },
  {
    id: "model-family",
    term: "Model family",
    definition: "A group of related models made by the same company. Claude is Anthropic's model family. GPT is OpenAI's. Each family has multiple versions with different tradeoffs.",
    analogy: null
  },
  {
    id: "api",
    term: "API (Application Programming Interface)",
    definition: "A way for one piece of software to talk to another. When a tool says it's “powered by Claude,” it's connecting to Claude via API.",
    analogy: "A waiter — takes your order to the kitchen and brings back the result."
  },
  {
    id: "token",
    term: "Token",
    definition: "The unit AI uses to process text. Not quite words, not quite letters — roughly ¾ of a word on average. Everything is measured in tokens: cost, speed, memory.",
    analogy: null
  },
  {
    id: "context-window",
    term: "Context window",
    definition: "How much an AI model can “see” at once, measured in tokens. Everything in your conversation — your prompts and the AI's responses — lives here.",
    analogy: "A whiteboard. When it fills up, older content gets erased to make room."
  },
  {
    id: "training",
    term: "Training",
    definition: "The process by which a model learned what it knows — exposure to enormous amounts of text, learning patterns in how words and ideas follow each other.",
    analogy: null
  },
  {
    id: "parameters",
    term: "Parameters",
    definition: "The internal numbers that define how a model behaves, set during training. More parameters generally means more capable — but also slower and more expensive.",
    analogy: null
  },
  {
    id: "agent",
    term: "Agent",
    definition: "An AI that takes a sequence of actions to accomplish a goal, rather than just responding to a single prompt.",
    analogy: "The difference between asking someone a question and delegating a task."
  },
  {
    id: "mcp",
    term: "MCP (Model Context Protocol)",
    definition: "A standardized way to give AI models access to external tools and data — files, search, live information.",
    analogy: "A library card on top of existing knowledge."
  },
  {
    id: "claude-md",
    term: "CLAUDE.md",
    definition: "A file that gives Claude persistent instructions about your project. Rules, preferences, and context that Claude reads automatically every session.",
    analogy: "An onboarding doc that gets read perfectly every time, and never forgotten."
  },
  {
    id: "hallucination",
    term: "Hallucination",
    definition: "When an AI states something confidently that is factually wrong. Happens because models learned patterns, not facts — they predict plausible responses, not correct ones.",
    analogy: null
  },
  {
    id: "prompt",
    term: "Prompt",
    definition: "The input you give an AI. Your question, instruction, or request.",
    analogy: null
  },
  {
    id: "bash",
    term: "Bash",
    definition: "A way of talking directly to your computer through text commands, bypassing the visual interface. When Claude Code asks you to approve a bash command, it's asking permission to run an instruction on your computer.",
    analogy: "The difference between telling a contractor what to do in person versus handing them written instructions to execute."
  },
  {
    id: "repository",
    term: "Repository (repo)",
    definition: "A project folder that tracks the complete history of every change made to every file inside it.",
    analogy: "A project folder with a memory — it holds your files and a record of every version of every file you've ever saved."
  },
  {
    id: "git",
    term: "Git",
    definition: "The tool that manages version history in a repository. Runs locally on your computer. Not the same as GitHub.",
    analogy: "Track changes for your entire project — across every file, never forgetting anything."
  },
  {
    id: "github",
    term: "GitHub / GitLab",
    definition: "Cloud platforms that store repositories online so they can be backed up, shared, and collaborated on.",
    analogy: "Google Drive, but specifically for code and built around version history."
  },
  {
    id: "terminal",
    term: "Terminal",
    definition: "A text-based interface for talking directly to your computer. Where bash commands are run. Claude Code operates through the terminal.",
    analogy: "A text message thread with your operating system — you type instructions, it responds with results."
  }
];

/* id -> entry lookup (shared by popover + page) */
window.GLOSSARY_BY_ID = window.GLOSSARY.reduce(function (m, e) { m[e.id] = e; return m; }, {});
