"""Demo: a durable order-support agent built with Dapr Agents.

Run:
    dapr run --app-id support-agent --resources-path resources -- python agent.py

Call:
    curl -X POST localhost:8001/agent/run -H "Content-Type: application/json" \
         -d '{"task": "Where is my order 1042?"}'
"""

from dapr_agents import AgentRunner, DurableAgent
from dapr_agents.agents.configs import AgentMemoryConfig, AgentStateConfig
from dapr_agents.llm import DaprChatClient
from dapr_agents.memory import ConversationDaprStateMemory
from dapr_agents.storage.daprstores.stateservice import StateStoreService

from tools import get_order, open_ticket


def main() -> None:
    agent = DurableAgent(
        name="SupportAgent",
        role="Order support assistant",
        instructions=[
            "Answer briefly and to the point.",
            "Use the tools to look up orders; never make up data.",
            "Only open a ticket when the customer explicitly asks for one.",
        ],
        tools=[get_order, open_ticket],
        # LLM through the Dapr Conversation API: the provider lives in YAML, not in code.
        llm=DaprChatClient(component_name="llm-provider"),
        # Conversation history persisted in a state store (survives restarts).
        memory=AgentMemoryConfig(
            store=ConversationDaprStateMemory(store_name="agent-memory"),
            # Skip the end-of-run summary (an extra LLM call that takes ~50s on a local model).
            summarize_on_completion=False,
        ),
        # Workflow execution state (every LLM/tool step is a checkpoint).
        state=AgentStateConfig(
            store=StateStoreService(store_name="agent-workflow")
        ),
    )

    runner = AgentRunner()
    try:
        # Exposes POST /agent/run and GET /agent/instances/{id} on port 8001.
        runner.serve(agent, port=8001)
    finally:
        runner.shutdown()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nAgent stopped.")
