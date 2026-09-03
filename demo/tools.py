"""Demo tools: a fake in-memory "order system".

Every function decorated with @tool becomes a tool the LLM can call.
The docstring and type hints become the schema sent to the model.
"""

import asyncio

from dapr_agents import tool

ORDERS = {
    "1042": {"customer": "Ana", "status": "in transit", "eta": "Oct 31", "carrier": "FedEx"},
    "1043": {"customer": "Bruno", "status": "awaiting payment", "eta": "-", "carrier": "-"},
    "1044": {"customer": "Carla", "status": "delivered", "eta": "Oct 27", "carrier": "UPS"},
}


@tool
async def get_order(order_id: str) -> str:
    """Look up the status and delivery estimate of an order by its number."""
    order = ORDERS.get(order_id)
    if not order:
        return f"Order {order_id} not found."
    return (
        f"Order {order_id} ({order['customer']}): status '{order['status']}', "
        f"ETA {order['eta']}, carrier {order['carrier']}."
    )


@tool
async def open_ticket(order_id: str, reason: str) -> str:
    """Open a support ticket for an order. Simulates a slow call to an external system."""
    # Intentional delay: gives you time to kill the process (Ctrl+C) mid-run
    # and show that the workflow resumes from where it stopped after a restart.
    await asyncio.sleep(8)
    ticket = hash((order_id, reason)) % 9000 + 1000
    return f"Ticket #{ticket} opened for order {order_id}: {reason}"
