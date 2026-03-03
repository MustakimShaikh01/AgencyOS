import logging
import json
from typing import Dict, Any, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models import Campaign, Task, Decision, Agent
from app.db.session import AsyncSessionLocal
from app.agents import AGENT_REGISTRY
from app.llm.multi_model_executor import multi_model_executor
from app.core.authority_engine import authority_engine
from app.core.decision_engine import decision_engine
from app.core.workflow_engine import workflow_engine

logger = logging.getLogger(__name__)

class Orchestrator:
    """Central engine managing Campaign lifecycles, assigning workflows, and handling revisions."""

    async def run_campaign(self, campaign_id: int) -> None:
        """Start or resume a campaign workflow end-to-end."""
        
        async with AsyncSessionLocal() as session:
            campaign = await session.get(Campaign, campaign_id)
            if not campaign:
                logger.error(f"Campaign {campaign_id} not found.")
                return
                
            logger.info(f"Starting Campaign {campaign.name} (Type: {campaign.workflow_type})")
            campaign.status = "running"
            await session.commit()
            
            # Step 1: Strategist Planning (Always First)
            from app.logs.action_logger import action_logger
            from app.llm.rag_engine import rag_engine
            import asyncio
            
            await action_logger.log("MEETING", "strategist", "campaign", campaign.id, {"title": campaign.name, "message": f"Team gather up! We have a new campaign: {campaign.name}"})
            await asyncio.sleep(2)
            await action_logger.log("MEETING", "content_writer", "campaign", campaign.id, {"title": campaign.name, "message": "I'm looking at the brief now. Any specific market angles we should take?"})
            await asyncio.sleep(3)
            
            # Perform Local RAG Lookup for Market Trends
            trends = rag_engine.retrieve_trends(f"{campaign.name} {campaign.brand_guidelines}")
            trend_snippet = trends.split('\n')[0][:75] + "..." if trends else "Stick to the classics."
            
            await action_logger.log("MEETING", "strategist", "campaign", campaign.id, {"title": campaign.name, "message": f"Our RAG Database says: '{trend_snippet}'. Let's frame around that."})
            await asyncio.sleep(3)
            await action_logger.log("MEETING", "finance_controller", "campaign", campaign.id, {"title": campaign.name, "message": f"Agreed. Just keep the allocations under our ${campaign.total_budget} budget!"})
            await asyncio.sleep(2)
            await action_logger.log("MEETING", "strategist", "campaign", campaign.id, {"title": campaign.name, "message": "Give me a second. Im drafting the sub-tasks payload..."})
            
            strategist = AGENT_REGISTRY.get("strategist")
            if not strategist:
                raise RuntimeError("Strategist agent not found in registry.")
                
            planner_response = await self.execute_agent(
                agent_name="strategist",
                task_data={"campaign_brief": campaign.name, "budget": campaign.total_budget},
                context={"brand_guidelines": campaign.brand_guidelines, "market_trends": trends},
                session=session
            )
            
            # Sub-Task Generation
            sub_tasks_spec = planner_response.get("sub_tasks", [])
            tasks_queue = []
            
            for spec in sub_tasks_spec:
                # Dynamically create Task in DB
                new_task = Task(
                    campaign_id=campaign.id,
                    title=spec.get("title", "Unnamed Task"),
                    description=spec.get("description", ""),
                    assigned_agent=spec.get("assigned_to", "content_writer"),
                    platform=spec.get("platform", "internal"),
                    budget=float(spec.get("budget", 0.0)),
                    status="pending"
                )
                session.add(new_task)
                await session.flush() # To get a task ID
                tasks_queue.append(new_task)
                
            await session.commit()
            
            # Step 2: Agent Execution Loop
            for task in tasks_queue:
                logger.info(f"\n--- Processing Task: {task.title} (Agent: {task.assigned_agent}) ---")
                
                from app.logs.action_logger import action_logger
                await action_logger.log("TASK_STARTED", task.assigned_agent, "task", task.id, {"title": task.title, "budget": task.budget, "message": f"I'll prioritize writing: {task.title}"})
                
                # Execute Creator
                await self._handle_task_lifecycle(task, campaign.brand_guidelines, session)
                
            logger.info(f"Campaign {campaign.name} workflow completed!")
            
            # Step 3: Chief Intelligence Officer (CIO) Performance Review
            from app.core.knowledge_store import knowledge_store
            
            # Gather all completed work for the CIO
            tasks_data = []
            for t in tasks_queue:
                tasks_data.append({
                    "title": t.title,
                    "agent": t.assigned_agent,
                    "output": t.output_content,
                    "revisions": t.revision_count
                })

            await action_logger.log("EVALUATING", "cio", "campaign", campaign.id, {"title": "Full Campaign Review", "message": "Analyzing fleet performance and synergy..."})
            
            cio_response = await self.execute_agent(
                agent_name="cio",
                task_data={"campaign_name": campaign.name, "tasks_completed": tasks_data},
                context={},
                session=session
            )
            
            # Store Campaign Summary in Knowledge Store
            knowledge_store.add_entry(
                entry_type="campaign_summary",
                actor="cio",
                content=cio_response.get("summary", ""),
                metadata={
                    "campaign_id": campaign.id,
                    "campaign_name": campaign.name,
                    "promotions": cio_response.get("promotions", []),
                    "real_world_advice": cio_response.get("real_world_advice", "")
                }
            )

            # Apply Promotions/Rewards based on CIO judgement
            for promo in cio_response.get("promotions", []):
                target = promo.get("agent")
                if target:
                    await self._reward_agent(session, target, "cio_promotion_bonus")

            await action_logger.log("CAMPAIGN_COMPLETED", "orchestrator", "campaign", campaign.id, {
                "status": "completed", 
                "summary": cio_response.get("summary"),
                "advice": cio_response.get("real_world_advice")
            })
            
            campaign.status = "completed"
            await session.commit()

    async def _handle_task_lifecycle(self, task: Task, guidelines: str, session: AsyncSession) -> None:
        """Manages the Draft -> QA -> Risk -> Finance loop inside a single task."""
        
        # Determine specific workflow steps
        # E.g. content writer -> approver -> risk -> finance
        workflow_steps = ["approver", "risk_agent", "finance_controller"]
        
        creator_name = task.assigned_agent
        if not AGENT_REGISTRY.get(creator_name):
            logger.error(f"Creator {creator_name} not found.")
            return
            
        # 1. Draft Content
        task.status = "running"
        await session.commit()
        
        context = {"brand_guidelines": guidelines, "target_audience": "General"}
        draft_response = await self.execute_agent(creator_name, {"task_description": task.description}, context, session, task.id)
        
        task.output_content = json.dumps(draft_response)
        
        # 2. Revisions & Approvals Route
        for evaluator_name in workflow_steps:
            if evaluator_name == creator_name:
                continue # Skip self evaluation loop here since it ran during draft
                
            from app.logs.action_logger import action_logger
            await action_logger.log("EVALUATING", evaluator_name, "task", task.id, {"title": f"Reviewing {creator_name}'s work", "message": "Let me review this code and check if it meets our bar..."})
            
            eval_response = await self.execute_agent(
                evaluator_name, 
                {"content": task.output_content, "draft_content": task.output_content, "total_budget": 1000, "spent_budget": 0, "task_cost": task.budget, "tokens_used": 0}, 
                context, session, task.id
            )
            
            # Apply DB state and rules 
            state, reason = decision_engine.evaluate(evaluator_name, eval_response, task)
            
            await self._log_decision(session, task.id, evaluator_name, state, reason, eval_response)
            
            if state == "BLOCKED":
                task.status = "blocked"
                logger.error(f"Task {task.id} blocked by {evaluator_name}. Reason: {reason}")
                await self._penalize_agent(session, creator_name, "high_risk_block")
                await session.commit()
                return
                
            if state == "ESCALATED":
                task.status = "escalated"
                logger.warning(f"Task {task.id} escalated by {evaluator_name}: {reason}")
                await session.commit()
                return
                
            if state == "REVISION":
                task.revision_count += 1
                logger.warning(f"Revision {task.revision_count}/3 requested by {evaluator_name}.")
                
                if task.revision_count >= 3:
                    task.status = "failed"
                    await self._penalize_agent(session, creator_name, "down_limit_revisions")
                    await session.commit()
                    return
                else:
                    # Loop back to creator with instructions
                    context["revision_instructions"] = reason
                    draft_response = await self.execute_agent(creator_name, {"task_description": task.description + f"\nFix this: {reason}"}, context, session, task.id)
                    task.output_content = json.dumps(draft_response)
                    
        task.status = "approved"
        
        # Store approved content in corporate brain
        from app.core.knowledge_store import knowledge_store
        knowledge_store.add_entry(
            entry_type="approved_content",
            actor=creator_name,
            content=task.output_content,
            metadata={"task_id": task.id, "title": task.title}
        )

        await self._reward_agent(session, creator_name, "first_pass_approval")
        await session.commit()

    async def execute_agent(self, agent_name: str, task_data: Dict[str, Any], context: Dict[str, Any], session: AsyncSession, task_id: int = None) -> Dict[str, Any]:
        """Wrapper wrapping executor tracking usages and DB logging."""
        agent = AGENT_REGISTRY[agent_name]
        logger.debug(f">> {agent.role} is executing...")
        
        # Broadcast "THINKING" state specifically for the game UI
        try:
            from app.api.websocket import manager
            import json
            await manager.broadcast(json.dumps({
                "type": "THINKING",
                "actor": agent_name
            }))
        except Exception as e:
            pass
            
        # Build the full prompt using the agent's logic (including system prompts)
        prompt = await agent.build_prompt(task_data, context)
        
        # Send to LLM
        response = await multi_model_executor.execute(agent_name, prompt, task_id)
        
        return response

    async def _log_decision(self, session: AsyncSession, task_id: int, agent: str, state: str, reasoning: str, full: Dict[str, Any]) -> None:
        """Write decision directly into the single database (Phase 6 tie-in)."""
        from app.logs.decision_logger import decision_logger
        await decision_logger.log_decision(
            task_id=task_id,
            agent=agent,
            decision_type=state,
            score=full.get("overall_score") or full.get("risk_score") or 0.0,
            reasoning=reasoning,
            full_json=full
        )

        
    async def _penalize_agent(self, session: AsyncSession, agent_name: str, rule: str) -> None:
        """Penalty proxy grabbing agent obj from DB."""
        result = await session.execute(select(Agent).where(Agent.name == agent_name))
        db_agent = result.scalar_one_or_none()
        if db_agent:
            decision_engine.apply_xp_modifications(db_agent, rule)
            
    async def _reward_agent(self, session: AsyncSession, agent_name: str, rule: str) -> None:
        """Reward proxy."""
        result = await session.execute(select(Agent).where(Agent.name == agent_name))
        db_agent = result.scalar_one_or_none()
        if db_agent:
            decision_engine.apply_xp_modifications(db_agent, rule)

orchestrator = Orchestrator()
