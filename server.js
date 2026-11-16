
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({
  windowMs: 60 * 1000,
    limit: 30
    }));

    const agents = [
      {
          id: "core",
              name: "Genesis Core",
                  role: "Orchestration",
                      instructions: "Coordinate tasks and delegate work to specialist agents."
                        },
                          {
                              id: "architect",
                                  name: "Genesis Architect",
                                      role: "Application planning",
                                          instructions: "Turn app ideas into detailed development plans."
                                            },
                                              {
                                                  id: "coder",
                                                      name: "Genesis Coder",
                                                          role: "Code development",
                                                              instructions: "Write, explain and improve application code."
                                                                },
                                                                  {
                                                                      id: "designer",
                                                                          name: "Genesis Designer",
                                                                              role: "UI and UX design",
                                                                                  instructions: "Design intuitive, accessible and attractive interfaces."
                                                                                    },
                                                                                      {
                                                                                          id: "tester",
                                                                                              name: "Genesis Tester",
                                                                                                  role: "Testing and debugging",
                                                                                                      instructions: "Find bugs, test features and suggest fixes."
                                                                                                        }
                                                                                                        ];

                                                                                                        app.get("/api/health", (req, res) => {
                                                                                                          res.json({
                                                                                                              status: "online",
                                                                                                                  application: "Genesis AI Creation Studio",
                                                                                                                      aiConnected: Boolean(process.env.OPENAI_API_KEY)
                                                                                                                        });
                                                                                                                        });

                                                                                                                        app.get("/api/agents", (req, res) => {
                                                                                                                          res.json(agents);
                                                                                                                          });

                                                                                                                          app.post("/api/agents", (req, res) => {
                                                                                                                            const { name, role, instructions } = req.body;

                                                                                                                              if (!name || !role || !instructions) {
                                                                                                                                  return res.status(400).json({
                                                                                                                                        error: "Name, role and instructions are required."
                                                                                                                                            });
                                                                                                                                              }

                                                                                                                                                if (
                                                                                                                                                    typeof name !== "string" ||
                                                                                                                                                        typeof role !== "string" ||
                                                                                                                                                            typeof instructions !== "string" ||
                                                                                                                                                                name.length > 80 ||
                                                                                                                                                                    role.length > 120 ||
                                                                                                                                                                        instructions.length > 5000
                                                                                                                                                                          ) {
                                                                                                                                                                              return res.status(400).json({
                                                                                                                                                                                    error: "Invalid agent configuration."
                                                                                                                                                                                        });
                                                                                                                                                                                          }

                                                                                                                                                                                            const agent = {
                                                                                                                                                                                                id: `custom-${Date.now()}`,
                                                                                                                                                                                                    name,
                                                                                                                                                                                                        role,
                                                                                                                                                                                                            instructions
                                                                                                                                                                                                              };

                                                                                                                                                                                                                agents.push(agent);
                                                                                                                                                                                                                  res.status(201).json(agent);
                                                                                                                                                                                                                  });

                                                                                                                                                                                                                  app.post("/api/chat", async (req, res) => {
                                                                                                                                                                                                                    try {
                                                                                                                                                                                                                        const { agentId, message } = req.body;

                                                                                                                                                                                                                            if (
                                                                                                                                                                                                                                  typeof message !== "string" ||
                                                                                                                                                                                                                                        !message.trim() ||
                                                                                                                                                                                                                                              message.length > 12000
                                                                                                                                                                                                                                                  ) {
                                                                                                                                                                                                                                                        return res.status(400).json({
                                                                                                                                                                                                                                                                error: "Enter a valid message."
                                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                              const agent = agents.find(a => a.id === agentId);

                                                                                                                                                                                                                                                                                  if (!agent) {
                                                                                                                                                                                                                                                                                        return res.status(404).json({
                                                                                                                                                                                                                                                                                                error: "Agent not found."
                                                                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                                                              if (!process.env.OPENAI_API_KEY) {
                                                                                                                                                                                                                                                                                                                    return res.status(503).json({
                                                                                                                                                                                                                                                                                                                            error: "AI is not connected. Add your API key in the server's environment secrets."
                                                                                                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                          const openai = new OpenAI({
                                                                                                                                                                                                                                                                                                                                                apiKey: process.env.OPENAI_API_KEY
                                                                                                                                                                                                                                                                                                                                                    });

                                                                                                                                                                                                                                                                                                                                                        const response = await openai.responses.create({
                                                                                                                                                                                                                                                                                                                                                              model: "gpt-4.1-mini",
                                                                                                                                                                                                                                                                                                                                                                    instructions: agent.instructions,
                                                                                                                                                                                                                                                                                                                                                                          input: message
                                                                                                                                                                                                                                                                                                                                                                              });

                                                                                                                                                                                                                                                                                                                                                                                  res.json({
                                                                                                                                                                                                                                                                                                                                                                                        agent: agent.name,
                                                                                                                                                                                                                                                                                                                                                                                              reply: response.output_text
                                                                                                                                                                                                                                                                                                                                                                                                  });

                                                                                                                                                                                                                                                                                                                                                                                                    } catch (error) {
                                                                                                                                                                                                                                                                                                                                                                                                        console.error("Genesis AI error:", error.message);

                                                                                                                                                                                                                                                                                                                                                                                                            res.status(500).json({
                                                                                                                                                                                                                                                                                                                                                                                                                  error: "Genesis could not process this request."
                                                                                                                                                                                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                                                                                                                                                                        app.listen(PORT, "0.0.0.0", () => {
                                                                                                                                                                                                                                                                                                                                                                                                                          console.log(`Genesis server running on port ${PORT}`);
                                                                                                                                                                                                                                                                                                                                                                                                                          });
